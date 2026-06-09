// backend/server.js

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const mongoose    = require('mongoose');
const path        = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const seedAdmin = require('./seeds/seedAdmin');
const seedData  = require('./seeds/seedData');

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/powerlifting';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // bảo mật HTTP headers
app.use(compression());                             // gzip — nén mạnh response base64
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50mb' }));

// ── Health check: kiểm tra đã kết nối MongoDB hay chưa ────────────────────────
// Mở /api/health (hoặc /health) trên trình duyệt để xem trạng thái DB.
// readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];
app.get(['/health', '/api/health'], (_req, res) => {
  const state     = mongoose.connection.readyState;
  const connected = state === 1;
  // Luôn trả 200 để Render coi service là "healthy" (server vẫn sống);
  // trạng thái DB nằm trong body để đọc bằng mắt.
  res.status(200).json({
    success: connected,
    message: connected ? 'Đã kết nối MongoDB thành công.' : 'Chưa kết nối được MongoDB.',
    db: {
      connected,
      state: DB_STATES[state] || 'unknown',
      host:  mongoose.connection.host || null,
      name:  mongoose.connection.name || null,
    },
    uptimeSeconds: Math.round(process.uptime()),
    time: new Date().toISOString(),
  });
});

// ── Serve static React build (frontend/build) ────────────────────────────────
const clientPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(clientPath));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/data',   require('./routes/data'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/news',   require('./routes/news'));
app.use('/api/views',  require('./routes/views'));
app.use('/api/chat',   require('./routes/chat'));

// ── API 404 (trả JSON thay vì rơi vào SPA fallback) ──────────────────────────
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Not found.' }));

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));

// ── Khởi động server NGAY (để /api/health luôn truy cập được, kể cả khi DB lỗi) ─
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// ── Kết nối DB → seed (lỗi thì log, không tắt server) ─────────────────────────
connectDB(MONGO_URI)
  .then(async () => {
    await seedAdmin();
    await seedData();
  })
  .catch(err => {
    console.error('Khởi tạo DB thất bại, server vẫn chạy để /api/health báo trạng thái:', err.message);
  });
