// backend/routes/auth.js — Express router endpoints for Admin login and JWT verification

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');
const authenticateAdmin = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
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
