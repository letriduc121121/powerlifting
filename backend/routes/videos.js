// backend/routes/videos.js — Express routes cho CRUD video hướng dẫn.

const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const authenticateAdmin = require('../middleware/auth');
const { clean } = require('../utils/sanitize');

// Làm sạch field text do admin nhập (tags làm sạch từng phần tử).
const sanitizeVideo = (body) => {
  const out = { ...body };
  if (out.name !== undefined) out.name = clean(out.name);
  if (Array.isArray(out.tags)) out.tags = out.tags.map(clean);
  return out;
};

// Get All Videos
router.get('/', async (_req, res) => {
  try {
    const videos = await Video.find({}).sort({ pinned: -1, id: 1 }).lean();
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
    const newVideo = await Video.create({ ...sanitizeVideo(req.body), id: nextId });
    res.json({ success: true, data: newVideo });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500)
       .json({ success: false, message: error.name === 'ValidationError' ? error.message : 'Error creating video' });
  }
});

// Update Video
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await Video.findOneAndUpdate(
      { id: Number(req.params.id) }, sanitizeVideo(req.body), { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500)
       .json({ success: false, message: error.name === 'ValidationError' ? error.message : 'Error updating video' });
  }
});

// Delete Video
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Video.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting video' });
  }
});

module.exports = router;
