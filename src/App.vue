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

const loadDictionary = async () => {
  try {
    const hebrew = await fetch('/Strongs/strongs-hebrew-clean.json').then(r => r.json())
    const greek = await fetch('/Strongs/strongs-greek-clean.json').then(r => r.json())
    dictionary.value = { ...hebrew, ...greek }
    console.log('Dictionary loaded:', Object.keys(dictionary.value).length, 'entries')
    console.log('Sample Greek keys:', Object.keys(greek).slice(0, 10))
    console.log('Sample Hebrew keys:', Object.keys(hebrew).slice(0, 10))
  } catch (error) {
    console.error('Failed to load dictionaries:', error)
  }
}

const analyzeText = () => {
  const text = inputText.value.trim()
  if (!text) {
    analysisResults.value = []
    showAnalysis.value = false
    return
  }

  // Regular expression to find Strong's numbers (H1234 or G1234 format)
  const strongsPattern = /[HG]\d+/gi
  const matches = text.match(strongsPattern) || []
  
  // Count occurrences of each Strong's number
  const wordCounts = {}
  matches.forEach(match => {
    const normalizedMatch = match.toUpperCase()
    wordCounts[normalizedMatch] = (wordCounts[normalizedMatch] || 0) + 1
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
    
    // Debug logging
    if (strongsNum.startsWith('G')) {
      console.log(`Looking up ${strongsNum} -> ${lookupKey}`)
      console.log('Dictionary has key:', dictionary.value.hasOwnProperty(lookupKey))
      console.log('Entry:', entry)
      if (entry) {
        console.log('Word:', entry.word)
        console.log('Definition:', entry.definition)
      }
    }
    
    return {
      strongsNumber: strongsNum,
      count: count,
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

  // Create a new window with print-optimized content
  const printWindow = window.open('', '_blank')
  const currentDate = new Date().toLocaleDateString()
  
  const printContent = `<!DOCTYPE html>
<html>
<head>
  <title>Strong's Dictionary Analysis Report</title>
  <style>
    @page {
      size: letter;
      margin: 0.75in;
    }
    
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.2;
      color: #333;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 18pt;
      color: #2c3e50;
    }
    
    .summary {
      margin-bottom: 15px;
      font-size: 9pt;
      color: #666;
    }
    
    .results-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 8pt;
    }
    
    .results-table th {
      background-color: #007bff;
      color: white;
      padding: 6px 4px;
      text-align: left;
      font-weight: bold;
      font-size: 8pt;
      border: 1px solid #ddd;
    }
    
    .results-table td {
      padding: 4px;
      border: 1px solid #ddd;
      vertical-align: top;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .results-table tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .strongs-col {
      width: 12%;
      text-align: center;
      font-weight: bold;
      color: #007bff;
    }
    
    .count-col {
      width: 6%;
      text-align: center;
    }
    
    .lang-col {
      width: 5%;
      text-align: center;
    }
    
    .word-col {
      width: 18%;
      font-weight: 500;
    }
    
    .definition-col {
      width: 59%;
      line-height: 1.3;
    }
    
    .count-badge {
      background: #28a745;
      color: white;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 7pt;
      font-weight: bold;
    }
    
    .lang-badge {
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: bold;
    }
    
    .lang-hebrew {
      background: #ffc107;
      color: #000;
    }
    
    .lang-greek {
      background: #17a2b8;
      color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📖 Strong's Dictionary Text Analysis Report</h1>
    <div class="summary">
      Generated on: ${currentDate} | 
      Total Strong's Numbers: ${totalWords.value} | 
      Unique Words: ${uniqueWords.value}
    </div>
  </div>
  
  <table class="results-table">
    <thead>
      <tr>
        <th class="strongs-col">Strong's #</th>
        <th class="count-col">Count</th>
        <th class="lang-col">Lang</th>
        <th class="word-col">Word</th>
        <th class="definition-col">Definition</th>
      </tr>
    </thead>
    <tbody>
      ${analysisResults.value.map(result => `
        <tr>
          <td class="strongs-col">${result.strongsNumber}</td>
          <td class="count-col">
            <span class="count-badge">${result.count}</span>
          </td>
          <td class="lang-col">
            <span class="lang-badge ${result.language.toLowerCase() === 'hebrew' ? 'lang-hebrew' : 'lang-greek'}">
              ${result.language.charAt(0)}
            </span>
          </td>
          <td class="word-col">${result.word || 'N/A'}</td>
          <td class="definition-col">${result.definition || 'Definition not available'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <script>
    window.onload = function() {
      window.print();
    }
  <\/script>
</body>
</html>`
  
  printWindow.document.write(printContent)
  printWindow.document.close()
}

const totalWords = computed(() => {
  return analysisResults.value.reduce((sum, item) => sum + item.count, 0)
})

const uniqueWords = computed(() => {
  return analysisResults.value.length
})

onMounted(loadDictionary)
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
        
        <div class="input-group">
          <textarea 
            v-model="inputText" 
            placeholder="Enter or paste text with Strong's numbers (e.g., 'In the beginning H7225 God H430 created H1254 the heavens H8064 and the earth H776')..."
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