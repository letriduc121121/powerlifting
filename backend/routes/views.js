// backend/routes/views.js — Express router for incrementing view counts on news & videos

const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const News = require('../models/News');

router.post('/increment', async (req, res) => {
  const { itemType, itemId } = req.body;
  if (!itemType || !itemId) {
    return res.status(400).json({ success: false, message: 'itemType and itemId are required.' });
  }
  
  const Model = itemType === 'video' ? Video : itemType === 'news' ? News : null;
  if (!Model) return res.status(400).json({ success: false, message: 'Invalid itemType.' });

  try {
    const updated = await Model.findOneAndUpdate(
      { id: Number(itemId) },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Item not found.' });

    res.json({ success: true, views: updated.views });
  } catch (error) {
    console.error('Error incrementing view:', error.message);
    res.status(500).json({ success: false, message: 'Server error incrementing view.' });
  }
});

module.exports = router;
