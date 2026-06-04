const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'site_config.xlsx');
const wb = XLSX.readFile(filePath);
const data = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1'], { defval: '' });
console.log('site_config.xlsx contents:');
console.log(JSON.stringify(data, null, 2));

// Check if email exists
const emailEntry = data.find(d => d.config_key === 'email');
console.log('\n--- Email config:', emailEntry ? JSON.stringify(emailEntry) : 'NOT FOUND');
