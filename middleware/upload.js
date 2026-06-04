/**
 * ============================================================
 *  文件上传中间件 - middleware/upload.js
 *  功能：处理用户上传的文件（图片、项目文件等）
 *  学习重点：Multer 库的使用，文件上传的配置
 * ============================================================ */

const multer = require('multer');   // Express 文件上传处理库
const path = require('path');
const fs = require('fs');

// 上传文件的存放目录
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

/**
 * 配置 Multer 的存储引擎
 * destination: 文件保存到哪里
 * filename: 文件保存为什么名字
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });  // 确保目录存在
    cb(null, UPLOADS_DIR);  // 保存到 uploads 目录
  },
  filename: function (req, file, cb) {
    // 生成唯一的文件名：时间戳 + 随机数 + 原文件扩展名
    // 例如：1712345678-123456789.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

/**
 * 创建 Multer 上传实例
 * 限制：最大文件大小 500MB
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 },  // 500MB
});

module.exports = upload;
