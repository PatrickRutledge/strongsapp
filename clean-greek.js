import fs from 'fs';

const raw = fs.readFileSync('./Public/Strongs/strongs-greek.json', 'utf8');
const parsed = JSON.parse(raw);

// Grab the entries array
const entries = parsed.strongsdictionary?.entries?.entry || [];

const final = {};

entries.forEach((entry) => {
  if (!entry._attributes?.strongs) return;

  const strongsNum = 'G' + entry._attributes.strongs;
  
  // Extract the Greek word
  let word = '';
  if (entry.greek?._attributes?.unicode) {
    word = entry.greek._attributes.unicode;
  } else if (entry.greek?._attributes?.translit) {
    word = entry.greek._attributes.translit;
  }

  // Extract definition from strongs_def or kjv_def
  let definition = '';
  if (entry.strongs_def) {
    if (typeof entry.strongs_def === 'string') {
      definition = entry.strongs_def.trim();
    } else if (entry.strongs_def._text && typeof entry.strongs_def._text === 'string') {
      definition = entry.strongs_def._text.trim();
    } else if (Array.isArray(entry.strongs_def)) {
      definition = entry.strongs_def.map(item => 
        typeof item === 'string' ? item : (item._text || '')
      ).join(' ').trim();
    }
  } else if (entry.kjv_def) {
    if (typeof entry.kjv_def === 'string') {
      definition = entry.kjv_def.trim();
    } else if (entry.kjv_def._text && typeof entry.kjv_def._text === 'string') {
      definition = entry.kjv_def._text.trim();
    } else if (Array.isArray(entry.kjv_def)) {
      definition = entry.kjv_def.map(item => 
        typeof item === 'string' ? item : (item._text || '')
      ).join(' ').trim();
    }
  }

  // Clean up definition by removing extra whitespace and newlines
  definition = definition.replace(/\s+/g, ' ').trim();

  if (word || definition) {
    final[strongsNum] = {
      word: word || '',
      definition: definition || ''
    };
  }
});

fs.writeFileSync('./Public/Strongs/strongs-greek-clean.json', JSON.stringify(final, null, 2));
console.log('✅ Cleaned Greek dictionary written to strongs-greek-clean.json');
console.log(`Processed ${Object.keys(final).length} Greek entries`);