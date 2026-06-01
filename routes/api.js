const express = require('express');
const router = express.Router();
const { readData } = require('../utils/excel');

router.get('/projects', (req, res) => {
  let projects = readData('projects.xlsx');
  const { category } = req.query;
  if (category && category !== 'all') {
    projects = projects.filter(p => p.category === category);
  }
  projects.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
  res.json({ success: true, data: projects });
});

router.get('/config', (req, res) => {
  const configs = readData('site_config.xlsx');
  const config = {};
  configs.forEach(c => { config[c.config_key] = c.config_value; });
  res.json({ success: true, data: config });
});

module.exports = router;
