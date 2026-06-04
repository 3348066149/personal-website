/**
 * ============================================================
 *  首页路由 - routes/index.js
 *  功能：处理用户访问首页时的请求
 *  学习重点：Express 路由、服务端渲染、API 接口
 * ============================================================ */

const express = require('express');
const router = express.Router();  // 创建一个路由对象
const path = require('path');
const fs = require('fs');
const { readData } = require('../utils/excel');  // 读取 Excel 文件的工具函数
const { markdownToHtml } = require('../utils/markdown'); // Markdown 转 HTML 的工具函数

/**
 * 【重点】首页路由 - GET /
 * 流程：读取数据 → 处理数据 → 渲染模板 → 返回 HTML 给浏览器
 */
router.get('/', (req, res) => {

  // ===== 第1步：从 Excel 文件中读取数据 =====
  const projects = readData('projects.xlsx');  // 读取所有项目数据
  const configs = readData('site_config.xlsx'); // 读取网站配置（标题、邮箱、社交链接等）

  // ===== 第2步：把配置数组转换成更方便使用的对象 =====
  // Excel 中存储的是 [{config_key: "email", config_value: "xxx"}, ...] 这样的格式
  // 转换成 { email: "xxx", hero_title: "xxx", ... } 更方便在模板中使用
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });

  // ===== 第3步：获取项目分类 =====
  // 从 categories.xlsx 中读取分类，如果没有就使用默认的硬编码分类
  const dbCategories = readData('categories.xlsx') || [];
  var categories, categoryLabels;
  if (dbCategories.length > 0) {
    // 如果有自定义分类，按 sort_order 排序
    dbCategories.sort(function(a, b) { return (a.sort_order || 999) - (b.sort_order || 999); });
    categories = dbCategories.map(function(c) { return c.name; });       // 分类名称数组
    categoryLabels = {};                                                  // 分类标签映射
    dbCategories.forEach(function(c) { categoryLabels[c.name] = c.label; });
  } else {
    // 默认的三个分类
    categories = ['ai', 'unity', 'comprehensive'];
    categoryLabels = { ai: 'AI 项目', unity: 'Unity 项目', comprehensive: '综合项目' };
  }

  // ===== 第4步：筛选出精选项目（首页轮播展示） =====
  // 只选取标记为 is_featured === 'yes' 的项目
  const featuredProjects = projects.filter(p => p.is_featured === 'yes').sort((a, b) => a.sort_order - b.sort_order);

  // ===== 第5步：给每个项目附加分类的显示名称 =====
  // 方便前端弹窗显示
  projects.forEach(function(p) { p.category_label = categoryLabels[p.category] || p.category; });
  featuredProjects.forEach(function(p) { p.category_label = categoryLabels[p.category] || p.category; });

  // ===== 第6步：渲染 index.ejs 模板，传入数据 =====
  // 这些数据会注入到模板中，用 <%= %> 语法使用
  res.render('index', {
    projects,           // 所有项目（数组）
    config,             // 网站配置（对象）
    categories,         // 分类名称（数组）
    categoryLabels,     // 分类名称→显示名称（对象）
    featuredProjects,   // 精选项目（数组）
    markdownToHtml,     // Markdown 转换函数
    currentCategory: req.query.category || 'all',  // 当前选中的分类（从 URL 参数获取）
  });
});

/**
 * API 接口 - GET /api/projects
 * 功能：前端通过 AJAX 请求项目数据（用于动态加载）
 * 学习重点：JSON API 的写法
 */
router.get('/api/projects', (req, res) => {
  let projects = readData('projects.xlsx');
  const { category } = req.query;   // 从 URL 参数中获取分类（如 /api/projects?category=ai）
  if (category && category !== 'all') {
    projects = projects.filter(p => p.category === category);  // 按分类筛选
  }
  // 按排序序号排序
  projects.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
  res.json({ success: true, data: projects });  // 返回 JSON 格式的数据
});

/**
 * 文件下载接口 - GET /api/download/:id
 * 功能：下载项目的源文件
 * 学习重点：文件下载的实现
 */
router.get('/api/download/:id', (req, res) => {
  const projects = readData('projects.xlsx');
  const project = projects.find(p => Number(p.id) === Number(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  // 如果项目是本地文件类型，直接从服务器下载
  if (project.source_type === 'local' || project.source_type === 'both') {
    if (project.local_file_path) {
      const cleanPath = project.local_file_path.replace(/^\//, '');
      const filePath = path.join(__dirname, '..', 'public', cleanPath);
      if (fs.existsSync(filePath)) {
        return res.download(filePath);  // 触发浏览器下载
      }
    }
  }
  // 否则重定向到外部链接
  if (project.source_url) {
    return res.redirect(project.source_url);
  }
  res.status(404).json({ success: false, message: 'No source available' });
});

// 导出路由，供 app.js 使用
module.exports = router;
