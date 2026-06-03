// backend/routes/data.js — Express routes for application configuration settings

const express = require('express');
const router = express.Router();
const AppData = require('../models/AppData');
const authenticateAdmin = require('../middleware/auth');

// Get All App Data
router.get('/', async (req, res) => {
  try {
    let data = await AppData.findOne({ key: 'main' });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching app data:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching data.' });
  }
});

// Update App Data (Admin Only)
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { videos, news, ...updateFields } = req.body;
    
    console.log('--- Incoming AppData Update ---');
    console.log('Keys in req.body:', Object.keys(req.body));
    if (req.body.images) {
      console.log('Keys in req.body.images:', Object.keys(req.body.images));
      console.log('Logo length:', req.body.images.logo ? req.body.images.logo.length : 0);
      console.log('HeroBg length:', req.body.images.heroBg ? req.body.images.heroBg.length : 0);
    } else {
      console.log('req.body.images is UNDEFINED');
    }

    const updatedData = await AppData.findOneAndUpdate(
      { key: 'main' },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    if (updatedData && updatedData.images) {
      console.log('Updated AppData images keys in DB:', Object.keys(updatedData.images));
      console.log('Logo length in DB:', updatedData.images.logo ? updatedData.images.logo.length : 0);
      console.log('HeroBg length in DB:', updatedData.images.heroBg ? updatedData.images.heroBg.length : 0);
    }

    res.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error saving app data:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving data.' });
  }
});

module.exports = router;
