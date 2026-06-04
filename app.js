/**
 * ============================================================
 *  项目入口文件 - app.js
 *  功能：启动服务器，配置中间件，注册路由
 *  学习重点：Express 框架的基本用法
 * ============================================================ */

// 引入第三方依赖（通过 npm install 安装的包）
const express = require('express');         // Express 框架 - 用来搭建 Web 服务器
const session = require('express-session'); // Session 中间件 - 用来管理登录状态
const path = require('path');              // Node.js 内置模块 - 处理文件路径
const fs = require('fs');                  // Node.js 内置模块 - 操作文件系统
const compression = require('compression'); // 压缩中间件 - 加快网页加载速度

// 创建 Express 应用实例（这就是我们的服务器）
const app = express();
// 设置端口号：优先使用环境变量中的 PORT，否则用 3000
const PORT = process.env.PORT || 3000;

// ========== 确保必要的文件夹存在 ==========
const dirs = [
  path.join(__dirname, 'data'),              // 存放 Excel 数据文件
  path.join(__dirname, 'public', 'uploads'),          // 存放上传的文件
  path.join(__dirname, 'public', 'uploads', 'config'), // 存放配置相关的上传文件
  path.join(__dirname, 'public', 'uploads', 'projects'), // 存放项目相关的上传文件
  path.join(__dirname, 'public', 'images'),            // 存放图片
];
// 遍历数组，如果文件夹不存在则创建
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

// 运行初始化脚本（创建默认的 Excel 数据文件）
require('./scripts/init');

// ========== 中间件配置（按顺序执行） ==========
app.use(compression());                      // 开启 gzip 压缩，让页面加载更快
app.use(express.json());                     // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析表单提交的数据
app.use(session({
  secret: 'personal-website-secret-key-2025', // 加密 Session 的密钥
  resave: false,                              // 是否每次请求都重新保存 Session
  saveUninitialized: true,                    // 是否保存未初始化的 Session
  cookie: { maxAge: 24 * 60 * 60 * 1000 }    // Cookie 有效期：24 小时
}));

// 静态文件服务 - 让浏览器可以直接访问 public 文件夹里的文件（CSS、JS、图片等）
app.use(express.static(path.join(__dirname, 'public')));

// 设置模板引擎为 EJS（在 HTML 中嵌入 JS 代码）
app.set('view engine', 'ejs');
// 指定模板文件存放的文件夹
app.set('views', path.join(__dirname, 'views'));

// ========== 注册路由 ==========
app.use('/', require('./routes/index'));  // 首页路由（用户看到的前端页面）
app.use('/admin', require('./routes/admin')); // 管理后台路由
app.use('/api', require('./routes/api'));  // API 路由（提供给前端 AJAX 调用的接口）

// ========== 404 错误处理 ==========
// 如果以上所有路由都没有匹配到，就显示 404 页面
app.use((req, res) => {
  res.status(404).render('404');
});

// ========== 启动服务器 ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`LAN access: http://<your-lan-ip>:${PORT}`);
  console.log(`Admin panel: http://<your-lan-ip>:${PORT}/admin/login`);
  console.log(`Default admin: admin / admin123`);
});
