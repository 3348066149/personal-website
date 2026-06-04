/**
 * ============================================================
 *  管理后台路由 - routes/admin.js
 *  功能：管理员登录、项目管理、网站配置、分类管理
 *  学习重点：文件上传、Session 验证、CRUD 操作
 * ============================================================ */

const express = require('express');
const router = express.Router();
const { readData, writeData, getNextId } = require('../utils/excel');
const auth = require('../middleware/auth');     // 登录验证中间件
const upload = require('../middleware/upload'); // 文件上传中间件
const path = require('path');
const fs = require('fs');

// 上传文件夹路径
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// ========== 辅助函数 ==========

/**
 * 把名称中的特殊字符替换掉，确保可以用作文件夹名
 * 例如：把 "我的项目/1" 变成 "我的项目_1"
 */
function sanitizeFolderName(name) {
  return String(name || 'untitled')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')  // 去掉 Windows 文件名非法字符
    .replace(/\s+/g, '_')                      // 空格替换为下划线
    .trim() || 'untitled';
}

/**
 * 获取项目的文件目录信息
 * 返回 { dir: 文件夹路径, urlPrefix: URL 访问前缀 }
 */
function getProjectDir(project) {
  if (project.project_dir) {
    return {
      dir: path.join(UPLOADS_DIR, 'projects', project.category, project.project_dir),
      urlPrefix: '/uploads/projects/' + project.category + '/' + project.project_dir,
    };
  }
  return null;
}

/**
 * 确保项目的文件夹存在，如果不存在就创建
 */
function ensureProjectDir(project) {
  var info = getProjectDir(project);
  if (!info) {
    // 第一次创建时生成 project_dir
    project.project_dir = sanitizeFolderName(project.title) + '_' + project.id;
    info = {
      dir: path.join(UPLOADS_DIR, 'projects', project.category, project.project_dir),
      urlPrefix: '/uploads/projects/' + project.category + '/' + project.project_dir,
    };
  }
  fs.mkdirSync(info.dir, { recursive: true });  // 递归创建文件夹
  return info;
}

/**
 * 把上传的文件从临时位置移动到项目的专属文件夹
 */
function moveFileToProjectDir(file, projectDir) {
  if (!file) return null;
  var srcPath = path.join(UPLOADS_DIR, file.filename);      // 临时路径
  var destPath = path.join(projectDir, file.filename);       // 目标路径
  if (fs.existsSync(srcPath)) {
    try {
      fs.renameSync(srcPath, destPath);                      // 先尝试移动
    } catch (err) {
      fs.copyFileSync(srcPath, destPath);                    // 移动失败就复制
      fs.unlinkSync(srcPath);                                // 然后删除原文件
    }
  }
  return destPath;
}

// ========== 登录/登出 ==========

/** 登录页面 */
router.get('/login', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/admin/projects');
  res.render('admin/login', { message: '' });
});

/** 处理登录提交 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admins = readData('admin.xlsx');
  const admin = admins.find(a => a.username === username && a.password === password);
  if (admin) {
    // 登录成功：把管理员信息存入 Session
    req.session.admin = { id: admin.id, username: admin.username, role: admin.role };
    return res.redirect('/admin/projects');
  }
  res.render('admin/login', { error: '用户名或密码错误' });
});

/** 退出登录 */
router.get('/logout', (req, res) => {
  req.session.destroy();  // 销毁 Session
  res.redirect('/admin/login');
});

// ========== 项目管理 ==========

/** 项目管理页面 - 显示所有项目列表 */
router.get('/projects', auth, (req, res) => {
  let projects = readData('projects.xlsx');
  const currentCategory = req.query.category || 'all';
  if (currentCategory !== 'all') {
    projects = projects.filter(p => p.category === currentCategory);
  }
  projects.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
  const configs = readData('site_config.xlsx');
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });
  var categories = readData('categories.xlsx') || [];
  res.render('admin/projects', { projects, config, categories, message: req.query.message || '', currentCategory });
});

/** 添加新项目 */
router.post('/projects/add', auth, upload.fields([
  { name: 'cover_image_file', maxCount: 1 },
  { name: 'local_file', maxCount: 1 },
]), (req, res) => {
  const projects = readData('projects.xlsx');
  const newProject = {
    id: getNextId(projects),       // 自动生成下一个 ID
    title: req.body.title || '',
    description: req.body.description || '',
    category: req.body.category || 'ai',
    tech_stack: req.body.tech_stack || '',
    cover_image: '/images/placeholder-' + (req.body.category || 'ai') + '.jpg',
    demo_link: req.body.demo_link || '',
    code_link: req.body.code_link || '',
    video_link: req.body.video_link || '',
    source_type: req.body.source_type || 'url',
    local_file_path: '',
    local_file_size: '',
    source_url: req.body.source_url || '',
    completion_date: req.body.completion_date || '',
    sort_order: req.body.sort_order || projects.length + 1,
    is_featured: req.body.is_featured || 'no',
  };

  // 创建项目文件夹
  var projectInfo = ensureProjectDir(newProject);

  // 处理上传的封面图
  if (req.files['cover_image_file'] && req.files['cover_image_file'][0]) {
    var file = req.files['cover_image_file'][0];
    moveFileToProjectDir(file, projectInfo.dir);
    newProject.cover_image = projectInfo.urlPrefix + '/' + file.filename;
  }
  // 处理上传的项目文件
  if (req.files['local_file'] && req.files['local_file'][0]) {
    var file = req.files['local_file'][0];
    moveFileToProjectDir(file, projectInfo.dir);
    newProject.local_file_path = projectInfo.urlPrefix + '/' + file.filename;
    newProject.local_file_size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  }

  projects.push(newProject);
  writeData('projects.xlsx', projects);
  res.redirect('/admin/projects?message=项目添加成功');
});

/** 编辑项目 */
router.post('/projects/edit/:id', auth, upload.fields([
  { name: 'cover_image_file', maxCount: 1 },
  { name: 'local_file', maxCount: 1 },
]), (req, res) => {
  let projects = readData('projects.xlsx');
  const index = projects.findIndex(p => Number(p.id) === Number(req.params.id));
  if (index === -1) return res.redirect('/admin/projects?message=项目不存在');

  // 更新项目字段
  projects[index].title = req.body.title || '';
  projects[index].description = req.body.description || '';
  projects[index].category = req.body.category || 'ai';
  projects[index].tech_stack = req.body.tech_stack || '';
  projects[index].demo_link = req.body.demo_link || '';
  projects[index].code_link = req.body.code_link || '';
  projects[index].video_link = req.body.video_link || '';
  projects[index].source_type = req.body.source_type || 'url';
  projects[index].source_url = req.body.source_url || '';
  projects[index].completion_date = req.body.completion_date || '';
  projects[index].sort_order = req.body.sort_order || projects[index].sort_order;
  projects[index].is_featured = req.body.is_featured || 'no';

  // 处理新上传的文件
  var projectInfo = ensureProjectDir(projects[index]);
  if (req.files['cover_image_file'] && req.files['cover_image_file'][0]) {
    var file = req.files['cover_image_file'][0];
    moveFileToProjectDir(file, projectInfo.dir);
    projects[index].cover_image = projectInfo.urlPrefix + '/' + file.filename;
  }
  if (req.files['local_file'] && req.files['local_file'][0]) {
    var file = req.files['local_file'][0];
    moveFileToProjectDir(file, projectInfo.dir);
    projects[index].local_file_path = projectInfo.urlPrefix + '/' + file.filename;
    projects[index].local_file_size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  }

  writeData('projects.xlsx', projects);
  res.redirect('/admin/projects?message=项目修改成功');
});

/** 删除项目 */
router.post('/projects/delete/:id', auth, (req, res) => {
  let projects = readData('projects.xlsx');
  const project = projects.find(p => Number(p.id) === Number(req.params.id));

  // 删除项目关联的文件夹
  if (project) {
    var projectInfo = getProjectDir(project);
    if (projectInfo && fs.existsSync(projectInfo.dir)) {
      try {
        fs.rmdirSync(projectInfo.dir, { recursive: true });
      } catch (e) {
        // 低版本 Node.js 不支持递归删除，用手动方式
        try {
          function deleteFolderRecursive(folderPath) {
            if (fs.existsSync(folderPath)) {
              fs.readdirSync(folderPath).forEach(function(file) {
                var curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                  deleteFolderRecursive(curPath);
                } else {
                  fs.unlinkSync(curPath);
                }
              });
              fs.rmdirSync(folderPath);
            }
          }
          deleteFolderRecursive(projectInfo.dir);
        } catch(e2) {}
      }
    }
  }

  // 从数据中移除该项目
  projects = projects.filter(p => Number(p.id) !== Number(req.params.id));
  writeData('projects.xlsx', projects);
  res.redirect('/admin/projects?message=项目已删除');
});

/** 切换精选状态（不用刷新页面） */
router.post('/projects/toggle-featured/:id', auth, (req, res) => {
  let projects = readData('projects.xlsx');
  const project = projects.find(p => Number(p.id) === Number(req.params.id));
  if (project) {
    project.is_featured = project.is_featured === 'yes' ? 'no' : 'yes';
    writeData('projects.xlsx', projects);
    res.json({ success: true, is_featured: project.is_featured });
  } else {
    res.status(404).json({ success: false });
  }
});

// ========== 网站配置 ==========

/** 配置页面 */
router.get('/config', auth, (req, res) => {
  const configs = readData('site_config.xlsx');
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });
  res.render('admin/config', { config, message: req.query.message || '' });
});

/** 保存配置 */
router.post('/config', auth, upload.fields([
  { name: 'avatar_file', maxCount: 1 },
  { name: 'wechat_image_file', maxCount: 1 },
]), (req, res) => {
  let configs = readData('site_config.xlsx');
  const updates = req.body;

  // 更新已有的配置项，或者添加新的
  Object.keys(updates).forEach(function(key) {
    var existing = configs.find(function(c) { return c.config_key === key; });
    if (existing) {
      existing.config_value = updates[key];
    } else {
      configs.push({ config_key: key, config_value: updates[key] });
    }
  });

  // 处理上传的图片文件
  var configDir = path.join(UPLOADS_DIR, 'config');
  fs.mkdirSync(configDir, { recursive: true });

  var files = req.files || {};

  function moveToConfigSubdir(file) {
    var srcPath = path.join(UPLOADS_DIR, file.filename);
    var destPath = path.join(configDir, file.filename);
    if (fs.existsSync(srcPath)) {
      try { fs.renameSync(srcPath, destPath); }
      catch (err) { fs.copyFileSync(srcPath, destPath); fs.unlinkSync(srcPath); }
    }
    return '/uploads/config/' + file.filename;
  }

  if (files['avatar_file'] && files['avatar_file'][0]) {
    const avatarConfig = configs.find(c => c.config_key === 'avatar_url');
    if (avatarConfig) avatarConfig.config_value = moveToConfigSubdir(files['avatar_file'][0]);
  }
  if (files['wechat_image_file'] && files['wechat_image_file'][0]) {
    const wechatImgConfig = configs.find(c => c.config_key === 'wechat_image_url');
    if (wechatImgConfig) {
      wechatImgConfig.config_value = moveToConfigSubdir(files['wechat_image_file'][0]);
    } else {
      configs.push({ config_key: 'wechat_image_url', config_value: moveToConfigSubdir(files['wechat_image_file'][0]) });
    }
  }

  writeData('site_config.xlsx', configs);
  res.redirect('/admin/config?message=配置已更新');
});

// ========== 修改密码 ==========

router.get('/change-password', auth, (req, res) => {
  const configs = readData('site_config.xlsx');
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });
  res.render('admin/change-password', { config, message: req.query.message || '' });
});

router.post('/change-password', auth, (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  if (new_password !== confirm_password) {
    return res.redirect('/admin/change-password?message=两次密码不一致');
  }
  let admins = readData('admin.xlsx');
  const admin = admins.find(a => Number(a.id) === Number(req.session.admin.id));
  if (!admin || admin.password !== current_password) {
    return res.redirect('/admin/change-password?message=当前密码错误');
  }
  admin.password = new_password;
  writeData('admin.xlsx', admins);
  res.redirect('/admin/change-password?message=密码修改成功');
});

// 图片上传（给富文本编辑器用）
router.post('/upload/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false });
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});

// ========== 分类管理 ==========

/** 获取所有分类（JSON） */
router.get('/categories', auth, function(req, res) {
  var cats = readData('categories.xlsx') || [];
  res.json({ success: true, data: cats });
});

/** 添加分类 */
router.post('/categories/add', auth, function(req, res) {
  var cats = readData('categories.xlsx') || [];
  var label = (req.body.label || req.body.name || '').trim();
  if (!label) return res.json({ success: false, message: '类别名称不能为空' });
  var name = label;
  if (cats.find(function(c) { return c.name === name; })) return res.json({ success: false, message: '分类已存在' });
  cats.push({
    id: (cats.length > 0 ? Math.max.apply(null, cats.map(function(c) { return Number(c.id) || 0; })) + 1 : 1),
    name: name,
    label: label,
    sort_order: cats.length + 1
  });
  writeData('categories.xlsx', cats);
  // 同时创建对应的文件夹
  fs.mkdirSync(path.join(UPLOADS_DIR, 'projects', name), { recursive: true });
  res.json({ success: true, data: cats });
});

/** 编辑分类 */
router.post('/categories/edit', auth, function(req, res) {
  var cats = readData('categories.xlsx') || [];
  var id = Number(req.body.id);
  var cat = cats.find(function(c) { return c.id === id; });
  if (!cat) return res.json({ success: false, message: '分类不存在' });
  var oldName = cat.name;
  var newLabel = (req.body.label || req.body.name || '').trim();
  if (!newLabel) return res.json({ success: false, message: '类别名称不能为空' });
  cat.label = newLabel;
  if (newLabel !== oldName) {
    if (cats.find(function(c) { return c.name === newLabel; })) return res.json({ success: false, message: '分类名称已存在' });
    // 重命名文件夹
    var oldDir = path.join(UPLOADS_DIR, 'projects', oldName);
    var newDir = path.join(UPLOADS_DIR, 'projects', newLabel);
    if (fs.existsSync(oldDir)) { try { fs.renameSync(oldDir, newDir); } catch(e) {} }
    // 同时更新项目中的分类名
    var projects = readData('projects.xlsx');
    projects.forEach(function(p) {
      if (p.category === oldName) {
        p.category = newLabel;
        if (p.cover_image) p.cover_image = p.cover_image.replace('/' + oldName + '/', '/' + newLabel + '/');
        if (p.local_file_path) p.local_file_path = p.local_file_path.replace('/' + oldName + '/', '/' + newLabel + '/');
      }
    });
    writeData('projects.xlsx', projects);
    cat.name = newLabel;
  }
  writeData('categories.xlsx', cats);
  res.json({ success: true, data: cats });
});

/** 删除分类 */
router.post('/categories/delete/:id', auth, function(req, res) {
  var cats = readData('categories.xlsx') || [];
  var id = Number(req.params.id);
  var cat = cats.find(function(c) { return c.id === id; });
  if (!cat) return res.json({ success: false, message: '分类不存在' });
  // 检查分类下是否有项目，有则不允许删除
  var projects = readData('projects.xlsx');
  var used = projects.filter(function(p) { return p.category === cat.name; });
  if (used.length > 0) return res.json({ success: false, message: '该分类下还有 ' + used.length + ' 个项目，无法删除' });
  // 删除文件夹
  var catDir = path.join(UPLOADS_DIR, 'projects', cat.name);
  if (fs.existsSync(catDir)) { try { fs.rmdirSync(catDir); } catch(e) {} }
  cats = cats.filter(function(c) { return c.id !== id; });
  // 如果没有分类了，自动创建一个默认分类
  if (cats.length === 0) {
    cats.push({ id: 1, name: '默认类别', label: '默认类别', sort_order: 1 });
    fs.mkdirSync(path.join(UPLOADS_DIR, 'projects', '默认类别'), { recursive: true });
  }
  writeData('categories.xlsx', cats);
  res.json({ success: true, data: cats });
});

// ========== 旧文件缓存管理 ==========
// OldTemp 是一个安全机制：编辑项目时，旧文件不会被立即删除，
// 而是移动到 .oldtemp 目录，方便找回

function getOldTempDir(project) {
  if (project.project_dir) {
    return path.join(UPLOADS_DIR, 'projects', project.category, project.project_dir, '.oldtemp');
  }
  return path.join(UPLOADS_DIR, 'oldtemp', String(project.id));
}

/** 把旧文件移到缓存目录 */
router.post('/projects/move-to-oldtemp/:id', auth, function(req, res) {
  var projects = readData('projects.xlsx');
  var project = projects.find(function(p) { return Number(p.id) === Number(req.params.id); });
  if (!project) return res.json({ success: false, message: '项目不存在' });

  var oldTempDir = getOldTempDir(project);
  fs.mkdirSync(oldTempDir, { recursive: true });

  if (project.cover_image) {
    var coverPath = project.cover_image.replace(/^\//, '');
    var srcPath = path.join(__dirname, '..', 'public', coverPath);
    if (fs.existsSync(srcPath)) {
      var destPath = path.join(oldTempDir, path.basename(coverPath));
      try { fs.renameSync(srcPath, destPath); }
      catch (err) { fs.copyFileSync(srcPath, destPath); fs.unlinkSync(srcPath); }
    }
  }
  if (project.local_file_path) {
    var filePath = project.local_file_path.replace(/^\//, '');
    var srcPath = path.join(__dirname, '..', 'public', filePath);
    if (fs.existsSync(srcPath)) {
      var destPath = path.join(oldTempDir, path.basename(filePath));
      try { fs.renameSync(srcPath, destPath); }
      catch (err) { fs.copyFileSync(srcPath, destPath); fs.unlinkSync(srcPath); }
    }
  }
  res.json({ success: true });
});

/** 查看缓存文件列表 */
router.get('/projects/oldtemp-files/:id', auth, function(req, res) {
  var projects = readData('projects.xlsx');
  var project = projects.find(function(p) { return Number(p.id) === Number(req.params.id); });
  if (!project) return res.json({ exists: false, files: [] });

  var oldTempDir = getOldTempDir(project);
  var exists = fs.existsSync(oldTempDir);
  var files = exists ? fs.readdirSync(oldTempDir).filter(function(f) { return f !== '.' && f !== '..'; }) : [];
  res.json({ exists: exists && files.length > 0, files: files });
});

/** 清理缓存文件 */
router.post('/projects/clear-oldtemp/:id', auth, function(req, res) {
  var projects = readData('projects.xlsx');
  var project = projects.find(function(p) { return Number(p.id) === Number(req.params.id); });
  if (!project) return res.json({ success: false, message: '项目不存在' });

  var oldTempDir = getOldTempDir(project);
  if (fs.existsSync(oldTempDir)) {
    fs.readdirSync(oldTempDir).forEach(function(f) {
      fs.unlinkSync(path.join(oldTempDir, f));
    });
    fs.rmdirSync(oldTempDir);
  }
  res.json({ success: true, message: '缓存已清理' });
});

module.exports = router;
