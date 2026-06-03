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
  
  try {
    let views = 0;
    if (itemType === 'video') {
      const updated = await Video.findOneAndUpdate(
        { id: Number(itemId) },
        { $inc: { views: 1 } },
        { new: true }
      );
      if (updated) views = updated.views;
    } else if (itemType === 'news') {
      const updated = await News.findOneAndUpdate(
        { id: Number(itemId) },
        { $inc: { views: 1 } },
        { new: true }
      );
      if (updated) views = updated.views;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid itemType.' });
    }
    
    res.json({ success: true, views });
  } catch (error) {
    console.error('Error incrementing view:', error.message);
    res.status(500).json({ success: false, message: 'Server error incrementing view.' });
  }
});

module.exports = router;
