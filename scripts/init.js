/**
 * ============================================================
 *  初始化脚本 - scripts/init.js
 *  功能：项目启动时自动运行，创建默认的数据文件和示例数据
 *  学习重点：项目初始化流程，默认数据处理
 * ============================================================
 *
 *  【这个脚本做了什么？】
 *  1. 确保必要的文件夹存在
 *  2. 如果 Excel 数据文件不存在，创建它们并设置表头
 *  3. 如果数据库是空的，插入默认数据（管理员账号、网站配置、示例项目）
 */

const path = require('path');
const fs = require('fs');
const { ensureFile, writeData, getFilePath } = require('../utils/excel');

// ===== 第1步：确保关键目录存在 =====
const DATA_DIR = path.join(__dirname, '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const dirs = [
  DATA_DIR,
  path.join(PUBLIC_DIR, 'uploads'),
  path.join(PUBLIC_DIR, 'uploads', 'config'),
  path.join(PUBLIC_DIR, 'images'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// ===== 第2步：确保 Excel 数据文件存在，并设置表头（列名） =====
ensureFile('projects.xlsx', [
  'id',               // 项目唯一编号
  'title',            // 项目标题
  'description',      // 项目描述
  'category',         // 所属分类
  'tech_stack',       // 技术栈
  'cover_image',      // 封面图片路径
  'video_link',       // 视频链接
  'source_type',      // 源码类型（url/local/both）
  'local_file_path',  // 本地文件路径
  'local_file_size',  // 本地文件大小
  'source_url',       // 源码 URL
  'completion_date',  // 完成日期
  'sort_order',       // 排序序号
  'is_featured',      // 是否精选（yes/no）
  'project_dir'       // 项目文件目录名
]);

ensureFile('admin.xlsx', ['id', 'username', 'password', 'role']);

ensureFile('site_config.xlsx', ['config_key', 'config_value']);

ensureFile('categories.xlsx', ['id', 'name', 'label', 'sort_order']);

// ===== 第3步：如果是空数据库，插入默认数据 =====

// 创建默认管理员账号
const admins = require('../utils/excel').readData('admin.xlsx');
if (admins.length === 0) {
  writeData('admin.xlsx', [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' }
  ]);
  console.log('Default admin created: admin / admin123');
}

// 创建默认网站配置
const configs = require('../utils/excel').readData('site_config.xlsx');
if (configs.length === 0) {
  writeData('site_config.xlsx', [
    { config_key: 'hero_title', config_value: 'Unity + AI Developer' },
    { config_key: 'hero_subtitle', config_value: 'Crafting immersive experiences at the intersection of game development and artificial intelligence' },
    { config_key: 'about_me', config_value: 'I am a passionate developer specializing in Unity game development and AI technologies.' },
    { config_key: 'avatar_url', config_value: '/images/avatar.jpg' },
    { config_key: 'email', config_value: 'hello@example.com' },
    { config_key: 'github_url', config_value: 'https://github.com' },
    { config_key: 'linkedin_url', config_value: 'https://linkedin.com' },
  ]);
  console.log('Default site config created');
}

// 创建默认分类
const categories = require('../utils/excel').readData('categories.xlsx');
if (categories.length === 0) {
  writeData('categories.xlsx', [
    { id: 1, name: '默认类别', label: '默认类别', sort_order: 1 }
  ]);
  console.log('Default category created');
}

// 创建默认示例项目
const projects = require('../utils/excel').readData('projects.xlsx');
if (projects.length === 0) {
  writeData('projects.xlsx', [
    {
      id: 1, title: 'AI Chat Assistant', description: 'An intelligent chatbot...',
      category: '默认类别', tech_stack: 'Python, PyTorch, Transformers, FastAPI',
      cover_image: '/images/placeholder-ai.jpg',
      video_link: '', source_type: 'url', local_file_path: '', local_file_size: '',
      source_url: 'https://github.com', completion_date: '2025-12-01', sort_order: 1, is_featured: 'yes'
    },
    {
      id: 2, title: '3D RPG Adventure', description: 'An immersive 3D role-playing game...',
      category: '默认类别', tech_stack: 'Unity, C#, Blender, Shader Graph',
      cover_image: '/images/placeholder-unity.jpg',
      video_link: '', source_type: 'url', local_file_path: '', local_file_size: '',
      source_url: 'https://github.com', completion_date: '2025-08-20', sort_order: 2, is_featured: 'yes'
    },
    {
      id: 3, title: 'AI-Powered Game NPCs', description: 'Implementing intelligent NPC behavior...',
      category: '默认类别', tech_stack: 'Unity, Python, ML-Agents, GPT API',
      cover_image: '/images/placeholder-comprehensive.jpg',
      video_link: '', source_type: 'url', local_file_path: '', local_file_size: '',
      source_url: 'https://github.com', completion_date: '2025-04-05', sort_order: 3, is_featured: 'yes'
    },
  ]);
  console.log('Sample projects created');
}

console.log('Initialization complete!');
