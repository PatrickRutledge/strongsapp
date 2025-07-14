const fs = require('fs');
const convert = require('xml-js');

const xml = fs.readFileSync('./Public/Strongs/strongs-hebrew.xml', 'utf8');
const json = convert.xml2json(xml, { compact: true, spaces: 2 });

fs.writeFileSync('./Public/Strongs/strongs-hebrew.json', json, 'utf8');

console.log('✅ Conversion complete!');
