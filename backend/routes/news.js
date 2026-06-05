// backend/routes/news.js — Express routes cho CRUD tin tức.

const express = require('express');
const router = express.Router();
const News = require('../models/News');
const authenticateAdmin = require('../middleware/auth');
const { clean } = require('../utils/sanitize');

// Làm sạch các field text do admin nhập (chống XSS lưu trữ).
const sanitizeNews = (body) => {
  const fields = ['title', 'cat', 'desc', 'fullContent'];
  const out = { ...body };
  fields.forEach((f) => { if (out[f] !== undefined) out[f] = clean(out[f]); });
  return out;
};

// Get All News
router.get('/', async (_req, res) => {
  try {
    const news = await News.find({}).sort({ pinned: -1, id: 1 }).lean();
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching news' });
  }
});

// Create News article
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const maxItem = await News.findOne().sort({ id: -1 });
    const nextId = maxItem ? maxItem.id + 1 : 1;
    const newNews = await News.create({ ...sanitizeNews(req.body), id: nextId });
    res.json({ success: true, data: newNews });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500)
       .json({ success: false, message: error.name === 'ValidationError' ? error.message : 'Error creating news' });
  }
});

// Update News article
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await News.findOneAndUpdate(
      { id: Number(req.params.id) }, sanitizeNews(req.body), { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'News not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500)
       .json({ success: false, message: error.name === 'ValidationError' ? error.message : 'Error updating news' });
  }
});

// Delete News article
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await News.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ success: false, message: 'News not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting news' });
  }
});

module.exports = router;
