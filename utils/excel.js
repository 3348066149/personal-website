const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function ensureFile(filename, schema) {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    if (!ws['!ref']) {
      const range = { s: { r: 0, c: 0 }, e: { r: 0, c: schema.length - 1 } };
      ws['!ref'] = XLSX.utils.encode_range(range);
      schema.forEach((col, i) => {
        const addr = XLSX.utils.encode_cell({ r: 0, c: i });
        ws[addr] = { t: 's', v: col };
      });
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filePath);
  }
}

function readData(filename) {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) return [];
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['Sheet1'];
  if (!ws) return [];
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return data;
}

function writeData(filename, data) {
  const filePath = getFilePath(filename);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data, { defval: '' });
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filePath);
}

function getNextId(data) {
  if (data.length === 0) return 1;
  return Math.max(...data.map(item => Number(item.id) || 0)) + 1;
}

module.exports = { ensureFile, readData, writeData, getNextId, getFilePath };
