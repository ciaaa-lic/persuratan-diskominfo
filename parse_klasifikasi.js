const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'kode_klasifikasi.txt');
const outputFile = path.join(__dirname, 'backend-persuratan/src/modules/klasifikasi/klasifikasi.data.ts');

const content = fs.readFileSync(inputFile, 'utf-8');

const regex = /\*\*(.*?)\*\*\s+(.*)/g;

const klasifikasi = [];
let match;
while ((match = regex.exec(content)) !== null) {
  let kode = match[1].trim();
  let uraian = match[2].trim();
  
  // Remove markdown formatting from uraian if any
  uraian = uraian.replace(/\*\*/g, '').trim();
  
  klasifikasi.push({ kode, uraian });
}

const fileContent = `export const KLASIFIKASI_RESMI_234 = ${JSON.stringify(klasifikasi, null, 2)};\n`;
fs.writeFileSync(outputFile, fileContent, 'utf-8');

console.log(`Parsed ${klasifikasi.length} classification codes.`);
