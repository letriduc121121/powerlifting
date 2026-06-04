// backend/routes/videos.js — Express routes for Video guides CRUD actions

const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const authenticateAdmin = require('../middleware/auth');

// Get All Videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ id: 1 }).lean();
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching videos' });
  }
});

// Create Video
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const maxItem = await Video.findOne().sort({ id: -1 });
    const nextId = maxItem ? maxItem.id + 1 : 1;
    const newVideo = await Video.create({ ...req.body, id: nextId });
    res.json({ success: true, data: newVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating video' });
  }
});

// Update Video
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await Video.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating video' });
  }
});

// Delete Video
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await Video.findOneAndDelete({ id: Number(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting video' });
  }
});

module.exports = router;
