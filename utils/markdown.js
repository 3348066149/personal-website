/**
 * ============================================================
 *  Markdown 转换工具 - utils/markdown.js
 *  功能：把 Markdown 文本转换成 HTML
 *  学习重点：字符串正则替换的用法
 *
 *  注意：这是一个简易的 Markdown 解析器，只支持基本语法。
 *  如果需要完整支持，可以使用 marked.js 等专业库。
 * ============================================================ */

/**
 * 把 Markdown 文本转为 HTML
 * @param {string} md - Markdown 格式的文本
 * @returns {string} HTML 格式的文本
 *
 * 支持的语法：
 *   # 标题     → <h1>标题</h1>
 *   ## 标题    → <h2>标题</h2>
 *   **粗体**   → <strong>粗体</strong>
 *   *斜体*     → <em>斜体</em>
 *   `代码`     → <code>代码</code>
 *   - 列表项   → <li>列表项</li>
 */
function markdownToHtml(md) {
  if (!md) return '';
  let html = md;
  // 【正则替换】按优先级从高到低处理
  html = html.replace(/### (.+)/g, '<h3>$1</h3>');      // 三级标题
  html = html.replace(/## (.+)/g, '<h2>$1</h2>');       // 二级标题
  html = html.replace(/# (.+)/g, '<h1>$1</h1>');        // 一级标题
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // 粗体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');     // 斜体
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');   // 行内代码
  html = html.replace(/- (.+)/g, '<li>$1</li>');        // 列表项
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>'); // 包裹 <ul>
  html = html.replace(/\n/g, '<br>');                    // 换行
  return html;
}

module.exports = { markdownToHtml };
