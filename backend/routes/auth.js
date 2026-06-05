// backend/routes/auth.js — Express router cho Admin login và xác minh JWT.

const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin     = require('../models/Admin');
const authenticateAdmin = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Chống brute-force: tối đa 10 lần thử đăng nhập / 15 phút / IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Quá nhiều lần thử. Vui lòng đợi 15 phút.' },
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  // Chỉ chấp nhận chuỗi → chặn NoSQL injection (vd: { "$gt": "" })
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/verify
router.get('/verify', authenticateAdmin, (req, res) => {
  res.json({ success: true, username: req.admin.username });
});

module.exports = router;
