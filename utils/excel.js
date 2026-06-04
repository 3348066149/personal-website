/**
 * ============================================================
 *  Excel 工具函数 - utils/excel.js
 *  功能：读写 Excel (.xlsx) 文件，作为简易数据库使用
 *  学习重点：Node.js 文件操作、Excel 文件的 JSON 转换
 * ============================================================
 *
 * 【为什么用 Excel 当数据库？】
 * 这个项目用 Excel 文件替代了真正的数据库（如 MySQL），
 * 优点是简单直观，用 Excel 就能编辑数据，适合小项目。
 * 缺点是不支持并发写入，数据量大时性能差。
 */

const XLSX = require('xlsx');  // 操作 Excel 文件的第三方库
const path = require('path');
const fs = require('fs');

// 数据文件存放在这个目录
const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * 获取数据文件的完整路径
 * @param {string} filename - 文件名，如 "projects.xlsx"
 * @returns {string} 完整的文件路径
 */
function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

/**
 * 确保 Excel 文件存在
 * 如果文件不存在，就用给定的表头（schema）创建一个空的 Excel 文件
 * @param {string} filename - 文件名
 * @param {string[]} schema - 列名数组，如 ["id", "title", "description"]
 */
function ensureFile(filename, schema) {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    // 创建一个新的 Excel 工作簿
    const wb = XLSX.utils.book_new();
    // 创建一个空的工作表
    const ws = XLSX.utils.json_to_sheet([]);
    // 设置表头（第一行）
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

/**
 * 从 Excel 文件中读取数据
 * @param {string} filename - 文件名
 * @returns {object[]} 返回对象数组，每个对象代表一行数据
 *
 * 示例返回值：
 * [
 *   { id: 1, title: "项目A", description: "描述..." },
 *   { id: 2, title: "项目B", description: "描述..." }
 * ]
 */
function readData(filename) {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) return [];
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['Sheet1'];
  if (!ws) return [];
  // 把工作表转换为 JSON 对象数组（空值用空字符串代替）
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return data;
}

/**
 * 把数据写入 Excel 文件
 * @param {string} filename - 文件名
 * @param {object[]} data - 要写入的数据（对象数组）
 */
function writeData(filename, data) {
  const filePath = getFilePath(filename);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data, { defval: '' });
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filePath);
}

/**
 * 获取下一个可用的 ID（自增）
 * @param {object[]} data - 现有数据
 * @returns {number} 下一个 ID
 */
function getNextId(data) {
  if (data.length === 0) return 1;
  return Math.max(...data.map(item => Number(item.id) || 0)) + 1;
}

module.exports = { ensureFile, readData, writeData, getNextId, getFilePath };
