// backend/server.js

const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const connectDB   = require('./config/db');
const seedAdmin   = require('./seeds/seedAdmin');
const seedData    = require('./seeds/seedData');

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/powerlifting';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Serve static frontend from project root ───────────────────────────────────
const clientPath = path.join(__dirname, '..');
app.use(express.static(clientPath));

// ── Connect DB → seed → start ─────────────────────────────────────────────────
connectDB(MONGO_URI).then(async () => {
  await seedAdmin();
  await seedData();

  // ── API Routes ──────────────────────────────────────────────────────────────
  app.use('/api/auth',   require('./routes/auth'));
  app.use('/api/data',   require('./routes/data'));
  app.use('/api/videos', require('./routes/videos'));
  app.use('/api/news',   require('./routes/news'));
  app.use('/api/views',  require('./routes/views'));

  // ── SPA fallback ────────────────────────────────────────────────────────────
  app.get('*', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
