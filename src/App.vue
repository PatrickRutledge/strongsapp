<script setup>
import { ref, onMounted, computed } from 'vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const inputText = ref('')
const singleLookup = ref('')
const singleResult = ref(null)
const dictionary = ref({})
const analysisResults = ref([])
const showAnalysis = ref(false)

const bible = ref(null)
const selectedBook = ref('')
const selectedChapter = ref('')
const fromVerse = ref('')
const toVerse = ref('')

const loadDictionary = async () => {
  try {
    const hebrew = await fetch('./Strongs/strongs-hebrew-clean.json').then(r => r.json())
    const greek = await fetch('./Strongs/strongs-greek-clean.json').then(r => r.json())
    dictionary.value = { ...hebrew, ...greek }
    console.log('Dictionary loaded:', Object.keys(dictionary.value).length, 'entries')
  } catch (error) {
    console.error('Failed to load dictionaries:', error)
  }
}

const loadBible = async () => {
  try {
    bible.value = await fetch('./Bibles/kjv.json').then(r => r.json())
    console.log('Bible loaded:', Object.keys(bible.value).length, 'books')
  } catch (error) {
    console.error('Failed to load Bible:', error)
  }
}

const bookNames = computed(() => bible.value ? Object.keys(bible.value) : [])

const chapterNumbers = computed(() => {
  if (!bible.value || !selectedBook.value) return []
  return Object.keys(bible.value[selectedBook.value])
    .map(n => parseInt(n, 10))
    .sort((a, b) => a - b)
})

const verseNumbers = computed(() => {
  if (!bible.value || !selectedBook.value || !selectedChapter.value) return []
  const chapter = bible.value[selectedBook.value][selectedChapter.value]
  if (!chapter) return []
  return Object.keys(chapter).map(n => parseInt(n, 10)).sort((a, b) => a - b)
})

const onBookChange = () => {
  selectedChapter.value = ''
  fromVerse.value = ''
  toVerse.value = ''
}

const onChapterChange = () => {
  const verses = verseNumbers.value
  fromVerse.value = verses.length ? String(verses[0]) : ''
  toVerse.value = verses.length ? String(verses[verses.length - 1]) : ''
}

const loadPassage = () => {
  if (!bible.value || !selectedBook.value || !selectedChapter.value) return
  const chapter = bible.value[selectedBook.value][selectedChapter.value]
  if (!chapter) return
  const from = parseInt(fromVerse.value, 10)
  const to = parseInt(toVerse.value, 10)
  if (Number.isNaN(from) || Number.isNaN(to) || from > to) return
  const parts = []
  for (let v = from; v <= to; v++) {
    const verseText = chapter[String(v)]
    if (verseText) parts.push(verseText)
  }
  inputText.value = parts.join(' ')
}

const analyzeText = () => {
  const text = inputText.value.trim()
  if (!text) {
    analysisResults.value = []
    showAnalysis.value = false
    return
  }

  // Capture each English word (or hyphenated phrase) that immediately precedes a Strong's number.
  // Example: "God H430" -> originalWord "God" for H430.
  const pairPattern = /([A-Za-z][A-Za-z'\-]*)[^A-Za-z0-9]*([HG]\d+)/gi
  const wordCounts = {}
  const originalWordsMap = {}

  let match
  while ((match = pairPattern.exec(text)) !== null) {
    const original = match[1]
    const strongsNum = match[2].toUpperCase()
    wordCounts[strongsNum] = (wordCounts[strongsNum] || 0) + 1
    if (!originalWordsMap[strongsNum]) originalWordsMap[strongsNum] = {}
    originalWordsMap[strongsNum][original] = (originalWordsMap[strongsNum][original] || 0) + 1
  }

  // Also count any Strong's numbers that appeared without a preceding word (start of text, etc.)
  const allStrongs = text.match(/[HG]\d+/gi) || []
  const totalCounts = {}
  allStrongs.forEach(s => {
    const up = s.toUpperCase()
    totalCounts[up] = (totalCounts[up] || 0) + 1
  })
  // Make sure every Strong's number is represented even if no original word was captured
  Object.keys(totalCounts).forEach(s => {
    if (!(s in wordCounts)) wordCounts[s] = totalCounts[s]
  })

  // Create analysis results
  const results = Object.entries(wordCounts).map(([strongsNum, count]) => {
    // Handle Greek numbers with leading zeros (G1 -> G00001)
    let lookupKey = strongsNum
    if (strongsNum.startsWith('G')) {
      const num = strongsNum.substring(1)
      lookupKey = 'G' + num.padStart(5, '0')
    }

    const entry = dictionary.value[lookupKey]

    // Build a display string of the original English word(s) used, with counts when >1
    const origs = originalWordsMap[strongsNum] || {}
    const origEntries = Object.entries(origs)
    const originalWord = origEntries.length === 0
      ? '—'
      : origEntries
          .sort((a, b) => b[1] - a[1])
          .map(([w, c]) => (c > 1 ? `${w} (${c})` : w))
          .join(', ')

    return {
      strongsNumber: strongsNum,
      count: totalCounts[strongsNum] || count,
      originalWord,
      word: entry?.word || 'Not found',
      definition: entry?.definition || 'Definition not available',
      language: strongsNum.startsWith('H') ? 'Hebrew' : 'Greek'
    }
  })

  // Sort by count (descending) then by Strong's number
  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.strongsNumber.localeCompare(b.strongsNumber)
  })

  analysisResults.value = results
  showAnalysis.value = true
}

const singleLookupFunc = () => {
  let key = singleLookup.value.trim().toUpperCase()
  
  // Handle Greek numbers with leading zeros (G1 -> G00001)
  if (key.startsWith('G')) {
    const num = key.substring(1)
    key = 'G' + num.padStart(5, '0')
  }
  
  singleResult.value = dictionary.value[key] || null
}

const clearAnalysis = () => {
  inputText.value = ''
  analysisResults.value = []
  showAnalysis.value = false
}

const exportToPDF = () => {
  if (!analysisResults.value || analysisResults.value.length === 0) {
    alert('No analysis results to export!')
    return
  }

  const currentDate = new Date().toLocaleDateString()
  
  // Create a temporary element with print styles
  const printElement = document.createElement('div')
  printElement.style.display = 'none' // Hide initially
  printElement.innerHTML = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: white;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        <h1 style="margin: 0; font-size: 24px; color: #2c3e50;">📖 Strong's Dictionary Text Analysis Report</h1>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">
          Generated on: ${currentDate} | 
          Total Strong's Numbers: ${totalWords.value} | 
          Unique Words: ${uniqueWords.value}
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>
          <tr>
            <th style="background-color: #007bff; color: white; padding: 8px; text-align: left; border: 1px solid #ddd;">Strong's #</th>
            <th style="background-color: #007bff; color: white; padding: 8px; text-align: left; border: 1px solid #ddd;">Count</th>
            <th style="background-color: #007bff; color: white; padding: 8px; text-align: left; border: 1px solid #ddd;">Language</th>
            <th style="background-color: #007bff; color: white; padding: 8px; text-align: left; border: 1px solid #ddd;">Original Text</th>
            <th style="background-color: #007bff; color: white; padding: 8px; text-align: left; border: 1px solid #ddd;">Word</th>
            <th style="background-color: #007bff; color: white; padding: 8px; text-align: left; border: 1px solid #ddd;">Definition</th>
          </tr>
        </thead>
        <tbody>
          ${analysisResults.value.map((result, index) => `
            <tr style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : ''}">
              <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold; color: #007bff;">${result.strongsNumber}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                <span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 8px; font-size: 8px; font-weight: bold;">${result.count}</span>
              </td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">
                <span style="padding: 2px 4px; border-radius: 3px; font-size: 8px; font-weight: bold; ${result.language.toLowerCase() === 'hebrew' ? 'background: #ffc107; color: #000;' : 'background: #17a2b8; color: white;'}">${result.language}</span>
              </td>
              <td style="padding: 6px; border: 1px solid #ddd; font-style: italic; color: #6f42c1;">${result.originalWord || '—'}</td>
              <td style="padding: 6px; border: 1px solid #ddd; font-weight: 500;">${result.word || 'N/A'}</td>
              <td style="padding: 6px; border: 1px solid #ddd; line-height: 1.3;">${result.definition || 'Definition not available'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
  
  // Add print styles that will apply only when printing
  const printStyles = document.createElement('style')
  printStyles.innerHTML = `
    @media print {
      /* Hide everything except the print content */
      body > *:not(.print-content) {
        display: none !important;
      }
      
      .print-content {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      @page {
        margin: 0.75in;
        size: letter;
      }
      
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
    }
  `
  
  // Add the print class to our element
  printElement.className = 'print-content'
  
  // Add styles and content to the document
  document.head.appendChild(printStyles)
  document.body.appendChild(printElement)
  
  // Show the print element and trigger print
  printElement.style.display = 'block'
  
  // Use setTimeout to ensure DOM is updated before printing
  setTimeout(() => {
    window.print()
    
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.removeChild(printElement)
      document.head.removeChild(printStyles)
    }, 1000)
  }, 100)
}

const totalWords = computed(() => {
  return analysisResults.value.reduce((sum, item) => sum + item.count, 0)
})

const uniqueWords = computed(() => {
  return analysisResults.value.length
})

onMounted(() => {
  loadDictionary()
  loadBible()
})
</script>

<template>
  <main class="app-container">
    <header class="app-header">
      <h1>📖 Strong's Dictionary Text Analyzer</h1>
      <p class="app-description">
        Analyze biblical text with Strong's numbers to discover word usage patterns, meanings, and original Hebrew/Greek definitions.
      </p>
    </header>
    <div class="main-content">
      
      <!-- Text Analysis Section -->
      <div class="analysis-section">
        <h2>📖 Text Analysis with Strong's Numbers</h2>
        <p class="description">
          Paste text containing Strong's numbers (like H1234 or G5678) to analyze word usage and get definitions.
        </p>
        
        <div class="passage-selector">
          <h3>📚 Load a KJV Passage</h3>
          <p class="passage-attribution">
            KJV text with Strong's numbers via
            <a href="https://eBible.org/find/details.php?id=eng-kjv2006" target="_blank" rel="noopener">eBible.org</a>
            (Public Domain).
          </p>
          <div class="passage-controls">
            <select v-model="selectedBook" @change="onBookChange" class="passage-select">
              <option value="">Book…</option>
              <option v-for="b in bookNames" :key="b" :value="b">{{ b }}</option>
            </select>
            <select v-model="selectedChapter" @change="onChapterChange" class="passage-select" :disabled="!selectedBook">
              <option value="">Chapter…</option>
              <option v-for="c in chapterNumbers" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="fromVerse" class="passage-select" :disabled="!selectedChapter">
              <option value="">From…</option>
              <option v-for="v in verseNumbers" :key="v" :value="v">{{ v }}</option>
            </select>
            <span class="passage-dash">–</span>
            <select v-model="toVerse" class="passage-select" :disabled="!selectedChapter">
              <option value="">To…</option>
              <option v-for="v in verseNumbers" :key="v" :value="v">{{ v }}</option>
            </select>
            <button @click="loadPassage" class="load-passage-btn" :disabled="!selectedChapter || !fromVerse || !toVerse">
              Load Passage
            </button>
          </div>
        </div>

        <div class="input-group">
          <textarea
            v-model="inputText"
            placeholder="Load a passage above, or paste text with Strong's numbers (e.g., 'In the beginning H7225 God H430 created H1254 the heavens H8064 and the earth H776')..."
            rows="6"
            class="text-input"
          ></textarea>
          <div class="button-group">
            <button @click="analyzeText" class="analyze-btn">
              🔍 Analyze Text
            </button>
            <button @click="exportToPDF" class="export-btn" v-if="showAnalysis">
              �️ Print to PDF
            </button>
            <button @click="clearAnalysis" class="clear-btn" v-if="showAnalysis">
              🗑️ Clear
            </button>
          </div>
        </div>

        <!-- Analysis Results -->
        <div v-if="showAnalysis" class="results-section">
          <div class="summary">
            <h3>📊 Analysis Summary</h3>
            <div class="stats">
              <div class="stat">
                <span class="stat-number">{{ totalWords }}</span>
                <span class="stat-label">Total Strong's Numbers</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ uniqueWords }}</span>
                <span class="stat-label">Unique Words</span>
              </div>
            </div>
          </div>

          <div class="results-table-container">
            <h3>📋 Word Analysis Results</h3>
            <table class="results-table">
              <thead>
                <tr>
                  <th>Strong's #</th>
                  <th>Count</th>
                  <th>Language</th>
                  <th>Original Text</th>
                  <th>Word</th>
                  <th>Definition</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in analysisResults" :key="result.strongsNumber" class="result-row">
                  <td class="strongs-number">{{ result.strongsNumber }}</td>
                  <td class="count">
                    <span class="count-badge">{{ result.count }}</span>
                  </td>
                  <td class="language">
                    <span :class="['language-badge', result.language.toLowerCase()]">
                      {{ result.language }}
                    </span>
                  </td>
                  <td class="original-word">{{ result.originalWord }}</td>
                  <td class="word">{{ result.word }}</td>
                  <td class="definition">{{ result.definition }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="analysisResults.length === 0" class="no-results">
            <p>No Strong's numbers found in the text. Make sure to include numbers in H1234 or G5678 format.</p>
          </div>
        </div>
      </div>

      <!-- Single Lookup Section -->
      <div class="single-lookup-section">
        <h2>🔍 Single Word Lookup</h2>
        <p class="description">
          Look up individual Strong's numbers for quick reference.
        </p>
        
        <div class="input-group">
          <input 
            v-model="singleLookup" 
            placeholder="Enter Strong's # (e.g., H1 or G3056)" 
            class="single-input"
            @keyup.enter="singleLookupFunc"
          />
          <button @click="singleLookupFunc" class="lookup-btn">Search</button>
        </div>

        <div v-if="singleResult" class="single-result">
          <div class="result-card">
            <h3>{{ singleResult.word }}</h3>
            <p class="definition">{{ singleResult.definition }}</p>
            <span class="strongs-ref">{{ singleLookup.toUpperCase() }}</span>
          </div>
        </div>

        <div v-else-if="singleLookup" class="no-match">
          <p>❌ No match found for "{{ singleLookup }}"</p>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-description {
  margin: 0;
  color: #6c757d;
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.main-content {
  margin-top: 2rem;
}

.analysis-section, .single-lookup-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analysis-section h2, .single-lookup-section h2 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 1rem;
}

.passage-selector {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.passage-selector h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.05rem;
  color: #2c3e50;
}

.passage-attribution {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  color: #6c757d;
}

.passage-attribution a {
  color: #007bff;
  text-decoration: none;
}

.passage-attribution a:hover {
  text-decoration: underline;
}

.passage-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.passage-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  min-width: 7rem;
}

.passage-select:disabled {
  background: #f1f3f5;
  cursor: not-allowed;
}

.passage-dash {
  font-weight: bold;
  color: #6c757d;
}

.load-passage-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #6f42c1;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.load-passage-btn:hover:not(:disabled) {
  background: #5a32a3;
}

.load-passage-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.text-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
}

.single-input {
  width: 70%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  margin-right: 1rem;
  transition: border-color 0.3s ease;
}

.single-input:focus {
  outline: none;
  border-color: #007bff;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.analyze-btn, .lookup-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.analyze-btn {
  background: #28a745;
  color: white;
}

.analyze-btn:hover {
  background: #218838;
}

.lookup-btn {
  background: #007bff;
  color: white;
}

.lookup-btn:hover {
  background: #0056b3;
}

.export-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #17a2b8;
  color: white;
}

.export-btn:hover {
  background: #138496;
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #dc3545;
  color: white;
}

.clear-btn:hover {
  background: #c82333;
}

.results-section {
  margin-top: 2rem;
}

.summary {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.summary h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  display: block;
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.results-table-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.results-table-container h3 {
  margin: 0;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th {
  background: #007bff;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.results-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
}

.result-row:hover {
  background: #f8f9fa;
}

.strongs-number {
  font-weight: bold;
  color: #007bff;
  white-space: nowrap;
}

.count-badge {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: bold;
}

.language-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.language-badge.hebrew {
  background: #ffc107;
  color: #212529;
}

.language-badge.greek {
  background: #17a2b8;
  color: white;
}

.original-word {
  font-style: italic;
  color: #6f42c1;
  font-weight: 500;
  white-space: normal;
  max-width: 180px;
}

.word {
  font-weight: 500;
  color: #2c3e50;
}

.definition {
  line-height: 1.4;
  color: #495057;
  max-width: 400px;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin-top: 1rem;
}

.single-result {
  margin-top: 1rem;
}

.result-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.result-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.result-card .definition {
  margin: 0;
  line-height: 1.5;
  color: #495057;
}

.strongs-ref {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.no-match {
  margin-top: 1rem;
  text-align: center;
  color: #dc3545;
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .app-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-description {
    font-size: 1rem;
  }
}
</style>