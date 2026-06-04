const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'site_config.xlsx');
const wb = XLSX.readFile(filePath);
const data = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1'], { defval: '' });

console.log('=== 当前配置数据 ===');
data.forEach(d => console.log(`  ${d.config_key} = ${d.config_value}`));

// Check if email needs update
const emailEntry = data.find(d => d.config_key === 'email');
if (emailEntry) {
  console.log(`\n当前邮箱: ${emailEntry.config_value}`);
  if (emailEntry.config_value !== '3348066149@qq.com') {
    emailEntry.config_value = '3348066149@qq.com';
    console.log('已更新邮箱为 3348066149@qq.com');
  } else {
    console.log('邮箱已经是正确的，无需修改');
  }
} else {
  data.push({ config_key: 'email', config_value: '3348066149@qq.com' });
  console.log('已添加邮箱配置');
}

// Rebuild and save
const ws = XLSX.utils.json_to_sheet(data, { defval: '' });
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, ws, 'Sheet1');
XLSX.writeFile(newWb, filePath);

console.log('\n=== 已保存的配置 ===');
const wb2 = XLSX.readFile(filePath);
const data2 = XLSX.utils.sheet_to_json(wb2.Sheets['Sheet1'], { defval: '' });
data2.forEach(d => console.log(`  ${d.config_key} = ${d.config_value}`));
