import fs from 'fs';

const raw = fs.readFileSync('./Public/Strongs/strongs-hebrew.json', 'utf8');
const parsed = JSON.parse(raw);

// Grab the entries array
const entries = parsed.osis?.osisText?.div?.div || [];

const final = {};

entries.forEach((entry) => {
  if (!entry._attributes?.n || !entry.w?._attributes) return;

  const strongsNum = 'H' + entry._attributes.n;
  const word = entry.w._attributes.xlit || '';
  let rawItems = entry.list?.item;
if (!rawItems) {
  rawItems = [];
} else if (!Array.isArray(rawItems)) {
  rawItems = [rawItems]; // wrap single item in array
}
const definitions = rawItems.map(i => i._text).filter(Boolean);


  final[strongsNum] = {
    word,
    definition: definitions.join('; ')
  };
});

fs.writeFileSync('./Public/Strongs/strongs-hebrew-clean.json', JSON.stringify(final, null, 2));
console.log('✅ Cleaned dictionary written to strongs-hebrew-clean.json');
