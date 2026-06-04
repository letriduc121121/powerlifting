// backend/routes/data.js — Express routes for application configuration settings

const express = require('express');
const router = express.Router();
const AppData = require('../models/AppData');
const authenticateAdmin = require('../middleware/auth');

// Get All App Data
router.get('/', async (req, res) => {
  try {
    const data = await AppData.findOne({ key: 'main' }).lean();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching app data:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching data.' });
  }
});

// Update App Data (Admin Only)
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { videos, news, ...updateFields } = req.body; // videos/news lưu ở collection riêng

    const updatedData = await AppData.findOneAndUpdate(
      { key: 'main' },
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    res.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error saving app data:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving data.' });
  }
});

module.exports = router;
