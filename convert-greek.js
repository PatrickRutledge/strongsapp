const fs = require('fs');
const convert = require('xml-js');

const xml = fs.readFileSync('./Public/Strongs/strongs-greek.xml', 'utf8');
const json = convert.xml2json(xml, { compact: true, spaces: 2 });

fs.writeFileSync('./Public/Strongs/strongs-greek.json', json, 'utf8');

console.log('✅ Greek XML converted to strongs-greek.json');
