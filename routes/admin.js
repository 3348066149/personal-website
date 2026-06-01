const express = require('express');
const router = express.Router();
const { readData, writeData, getNextId } = require('../utils/excel');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

router.get('/login', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/admin/projects');
  res.render('admin/login', { message: '' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admins = readData('admin.xlsx');
  const admin = admins.find(a => a.username === username && a.password === password);
  if (admin) {
    req.session.admin = { id: admin.id, username: admin.username, role: admin.role };
    return res.redirect('/admin/projects');
  }
  res.render('admin/login', { error: '用户名或密码错误' });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Projects management
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
  res.render('admin/projects', { projects, config, message: req.query.message || '', currentCategory });
});

router.post('/projects/add', auth, upload.fields([
  { name: 'cover_image_file', maxCount: 1 },
  { name: 'local_file', maxCount: 1 },
]), (req, res) => {
  const projects = readData('projects.xlsx');
  const newProject = {
    id: getNextId(projects),
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

  if (req.files['cover_image_file'] && req.files['cover_image_file'][0]) {
    newProject.cover_image = '/uploads/' + req.files['cover_image_file'][0].filename;
  }
  if (req.files['local_file'] && req.files['local_file'][0]) {
    const file = req.files['local_file'][0];
    newProject.local_file_path = '/uploads/' + file.filename;
    newProject.local_file_size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  }

  projects.push(newProject);
  writeData('projects.xlsx', projects);
  res.redirect('/admin/projects?message=项目添加成功');
});

router.post('/projects/edit/:id', auth, upload.fields([
  { name: 'cover_image_file', maxCount: 1 },
  { name: 'local_file', maxCount: 1 },
]), (req, res) => {
  let projects = readData('projects.xlsx');
  const index = projects.findIndex(p => Number(p.id) === Number(req.params.id));
  if (index === -1) return res.redirect('/admin/projects?message=项目不存在');

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

  if (req.files['cover_image_file'] && req.files['cover_image_file'][0]) {
    projects[index].cover_image = '/uploads/' + req.files['cover_image_file'][0].filename;
  }
  if (req.files['local_file'] && req.files['local_file'][0]) {
    const file = req.files['local_file'][0];
    projects[index].local_file_path = '/uploads/' + file.filename;
    projects[index].local_file_size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  }

  writeData('projects.xlsx', projects);
  res.redirect('/admin/projects?message=项目修改成功');
});

router.post('/projects/delete/:id', auth, (req, res) => {
  let projects = readData('projects.xlsx');
  const project = projects.find(p => Number(p.id) === Number(req.params.id));
  if (project && project.local_file_path) {
    const filePath = path.join(__dirname, '..', 'public', project.local_file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  projects = projects.filter(p => Number(p.id) !== Number(req.params.id));
  writeData('projects.xlsx', projects);
  res.redirect('/admin/projects?message=项目已删除');
});

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

// Config management
router.get('/config', auth, (req, res) => {
  const configs = readData('site_config.xlsx');
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });
  res.render('admin/config', { config, message: req.query.message || '' });
});

router.post('/config', auth, upload.single('avatar_file'), (req, res) => {
  let configs = readData('site_config.xlsx');
  const updates = req.body;
  configs.forEach(c => {
    if (updates[c.config_key] !== undefined) {
      c.config_value = updates[c.config_key];
    }
  });
  if (req.file) {
    const avatarConfig = configs.find(c => c.config_key === 'avatar_url');
    if (avatarConfig) avatarConfig.config_value = '/uploads/' + req.file.filename;
  }
  writeData('site_config.xlsx', configs);
  res.redirect('/admin/config?message=配置已更新');
});

// Change password
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

// Upload images (for rich text)
router.post('/upload/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false });
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});

module.exports = router;
