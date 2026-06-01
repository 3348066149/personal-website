const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { readData } = require('../utils/excel');
const { markdownToHtml } = require('../utils/markdown');

router.get('/', (req, res) => {
  const projects = readData('projects.xlsx');
  const configs = readData('site_config.xlsx');
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });

  const categories = ['ai', 'unity', 'comprehensive'];
  const categoryLabels = { ai: 'AI 项目', unity: 'Unity 项目', comprehensive: '综合项目' };

  const featuredProjects = projects.filter(p => p.is_featured === 'yes').sort((a, b) => a.sort_order - b.sort_order);

  res.render('index', {
    projects,
    config,
    categories,
    categoryLabels,
    featuredProjects,
    markdownToHtml,
    currentCategory: req.query.category || 'all',
  });
});

router.get('/api/projects', (req, res) => {
  let projects = readData('projects.xlsx');
  const { category } = req.query;
  if (category && category !== 'all') {
    projects = projects.filter(p => p.category === category);
  }
  projects.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
  res.json({ success: true, data: projects });
});

router.get('/api/download/:id', (req, res) => {
  const projects = readData('projects.xlsx');
  const project = projects.find(p => Number(p.id) === Number(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  if (project.source_type === 'local' || project.source_type === 'both') {
    if (project.local_file_path) {
      const filePath = path.join(__dirname, '..', 'public', project.local_file_path);
      if (fs.existsSync(filePath)) {
        return res.download(filePath);
      }
    }
  }
  if (project.source_url) {
    return res.redirect(project.source_url);
  }
  res.status(404).json({ success: false, message: 'No source available' });
});

module.exports = router;
