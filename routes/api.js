/**
 * ============================================================
 *  API 路由 - routes/api.js
 *  功能：提供数据接口给前端 JS 调用
 *  学习重点：JSON API、路由参数、文件操作
 * ============================================================ */

const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/excel');
const fs = require('fs');
const path = require('path');

// 上传文件夹的路径
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

/**
 * 清理已删除的项目
 * 检查每个项目关联的文件夹是否存在，如果不存在则从数据中移除
 * 这个函数避免了管理后台直接操作文件系统的风险
 */
function cleanMissingProjects(projects) {
  return projects.filter(function(p) {
    // 按优先级检查三种可能的文件夹路径

    // 1. 新系统：project_dir 指定了项目文件夹
    if (p.project_dir) {
      var d = path.join(UPLOADS_DIR, 'projects', p.category || 'unknown', p.project_dir);
      if (fs.existsSync(d)) return true;
    }
    // 2. 旧系统：folder_name 指定了文件夹
    var fn = p.folder_name || String(p.id);
    var d = path.join(UPLOADS_DIR, 'projects', fn);
    if (fs.existsSync(d)) return true;
    // 3. 最旧的系统：直接用项目 ID 作为文件夹名
    var ld = path.join(UPLOADS_DIR, 'projects', String(p.id));
    if (fs.existsSync(ld)) return true;

    return false; // 文件夹不存在，这个项目需要被清理
  });
}

/**
 * 获取项目列表 - GET /api/projects
 * 支持按分类筛选：/api/projects?category=ai
 */
router.get('/projects', function(req, res) {
  var projects = readData('projects.xlsx');

  // 自动清理文件夹已被删除的项目
  var cleaned = cleanMissingProjects(projects);
  if (cleaned.length !== projects.length) {
    writeData('projects.xlsx', cleaned);
    projects = cleaned;
  }

  // 按分类筛选
  var category = req.query.category;
  if (category && category !== 'all') {
    projects = projects.filter(function(p) { return p.category === category; });
  }
  // 按排序序号排序
  projects.sort(function(a, b) { return (a.sort_order || 999) - (b.sort_order || 999); });
  res.json({ success: true, data: projects });
});

/**
 * 获取网站配置 - GET /api/config
 * 返回所有配置项
 */
router.get('/config', function(req, res) {
  var configs = readData('site_config.xlsx');
  var config = {};
  configs.forEach(function(c) { config[c.config_key] = c.config_value; });
  res.json({ success: true, data: config });
});

module.exports = router;
