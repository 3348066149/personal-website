const path = require('path');
const fs = require('fs');
const { ensureFile, writeData, getFilePath } = require('../utils/excel');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const dirs = [
  DATA_DIR,
  path.join(PUBLIC_DIR, 'uploads'),
  path.join(PUBLIC_DIR, 'images'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

ensureFile('projects.xlsx', ['id', 'title', 'description', 'category', 'tech_stack', 'cover_image', 'demo_link', 'code_link', 'video_link', 'source_type', 'local_file_path', 'local_file_size', 'source_url', 'completion_date', 'sort_order', 'is_featured']);

ensureFile('admin.xlsx', ['id', 'username', 'password', 'role']);

ensureFile('site_config.xlsx', ['config_key', 'config_value']);

const admins = require('../utils/excel').readData('admin.xlsx');
if (admins.length === 0) {
  writeData('admin.xlsx', [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' }
  ]);
  console.log('Default admin created: admin / admin123');
}

const configs = require('../utils/excel').readData('site_config.xlsx');
if (configs.length === 0) {
  writeData('site_config.xlsx', [
    { config_key: 'hero_title', config_value: 'Unity + AI Developer' },
    { config_key: 'hero_subtitle', config_value: 'Crafting immersive experiences at the intersection of game development and artificial intelligence' },
    { config_key: 'about_me', config_value: 'I am a passionate developer specializing in Unity game development and AI technologies. With expertise in both fields, I create innovative projects that push the boundaries of interactive experiences.' },
    { config_key: 'avatar_url', config_value: '/images/avatar.jpg' },
    { config_key: 'email', config_value: 'hello@example.com' },
    { config_key: 'github_url', config_value: 'https://github.com' },
    { config_key: 'linkedin_url', config_value: 'https://linkedin.com' },
  ]);
  console.log('Default site config created');
}

const projects = require('../utils/excel').readData('projects.xlsx');
if (projects.length === 0) {
  writeData('projects.xlsx', [
    {
      id: 1, title: 'AI Chat Assistant', description: 'An intelligent chatbot powered by large language models, capable of natural conversations and task completion. Built with state-of-the-art NLP techniques.', category: 'ai', tech_stack: 'Python, PyTorch, Transformers, FastAPI', cover_image: '/images/placeholder-ai.jpg', demo_link: '', code_link: 'https://github.com', video_link: '', source_type: 'url', local_file_path: '', local_file_size: '', source_url: 'https://github.com', completion_date: '2025-12-01', sort_order: 1, is_featured: 'yes'
    },
    {
      id: 2, title: 'Neural Style Transfer', description: 'Real-time artistic style transfer application that transforms photos into masterpieces using deep learning. Supports multiple art styles.', category: 'ai', tech_stack: 'TensorFlow, OpenCV, Flask, React', cover_image: '/images/placeholder-ai.jpg', demo_link: '', code_link: 'https://github.com', video_link: '', source_type: 'url', local_file_path: '', local_file_size: '', source_url: 'https://github.com', completion_date: '2025-10-15', sort_order: 2, is_featured: 'yes'
    },
    {
      id: 3, title: '3D RPG Adventure', description: 'An immersive 3D role-playing game featuring procedurally generated worlds, dynamic combat system, and rich storytelling.', category: 'unity', tech_stack: 'Unity, C#, Blender, Shader Graph', cover_image: '/images/placeholder-unity.jpg', demo_link: '', code_link: 'https://github.com', video_link: '', source_type: 'url', local_file_path: '', local_file_size: '', source_url: 'https://github.com', completion_date: '2025-08-20', sort_order: 3, is_featured: 'yes'
    },
    {
      id: 4, title: 'VR Architecture Explorer', description: 'Virtual reality application for exploring architectural designs in an immersive 3D environment. Walk through buildings before they are built.', category: 'unity', tech_stack: 'Unity, XR Toolkit, C#, SketchUp', cover_image: '/images/placeholder-unity.jpg', demo_link: '', code_link: 'https://github.com', video_link: '', source_type: 'url', local_file_path: '', local_file_size: '', source_url: 'https://github.com', completion_date: '2025-06-10', sort_order: 4, is_featured: 'no'
    },
    {
      id: 5, title: 'AI-Powered Game NPCs', description: 'Implementing intelligent NPC behavior using reinforcement learning and natural language processing. NPCs that learn and adapt to player actions.', category: 'comprehensive', tech_stack: 'Unity, Python, ML-Agents, GPT API', cover_image: '/images/placeholder-comprehensive.jpg', demo_link: '', code_link: 'https://github.com', video_link: '', source_type: 'url', local_file_path: '', local_file_size: '', source_url: 'https://github.com', completion_date: '2025-04-05', sort_order: 5, is_featured: 'yes'
    },
    {
      id: 6, title: 'Procedural Terrain Generator', description: 'A Unity-based tool that generates realistic terrain using Perlin noise and advanced algorithms. Features biomes, erosion simulation, and LOD system.', category: 'comprehensive', tech_stack: 'Unity, C#, Compute Shaders, ECS', cover_image: '/images/placeholder-comprehensive.jpg', demo_link: '', code_link: 'https://github.com', video_link: '', source_type: 'url', local_file_path: '', local_file_size: '', source_url: 'https://github.com', completion_date: '2025-02-18', sort_order: 6, is_featured: 'no'
    },
  ]);
  console.log('Sample projects created');
}

console.log('Initialization complete!');
