const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directories exist
const dirs = [
  path.join(__dirname, 'data'),
  path.join(__dirname, 'public', 'uploads'),
  path.join(__dirname, 'public', 'images'),
];
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

// Initialize data files
require('./scripts/init');

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'personal-website-secret-key-2025',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`LAN access: http://<your-lan-ip>:${PORT}`);
  console.log(`Admin panel: http://<your-lan-ip>:${PORT}/admin/login`);
  console.log(`Default admin: admin / admin123`);
});
