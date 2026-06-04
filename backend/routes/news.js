// backend/routes/news.js — Express routes for news feed CRUD actions

const express = require('express');
const router = express.Router();
const News = require('../models/News');
const authenticateAdmin = require('../middleware/auth');

// Get All News
router.get('/', async (req, res) => {
  try {
    const news = await News.find({}).sort({ id: 1 }).lean();
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
    const newNews = await News.create({ ...req.body, id: nextId });
    res.json({ success: true, data: newNews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating news' });
  }
});

// Update News article
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await News.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating news' });
  }
});

// Delete News article
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await News.findOneAndDelete({ id: Number(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting news' });
  }
});

module.exports = router;
