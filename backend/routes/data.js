// backend/routes/data.js — Express routes cho cấu hình ứng dụng (AppData 'main').

const express = require('express');
const router = express.Router();
const AppData = require('../models/AppData');
const authenticateAdmin = require('../middleware/auth');
const { getAppData, setAppData } = require('../utils/appDataCache');

// Lấy toàn bộ AppData (phục vụ từ cache RAM → nhanh, tránh fetch lại Atlas mỗi lần)
router.get('/', async (_req, res) => {
  try {
    res.json({ success: true, data: await getAppData() });
  } catch (error) {
    console.error('Error fetching app data:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching data.' });
  }
});

// Cập nhật AppData (chỉ admin) — videos/news lưu ở collection riêng nên loại ra
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { videos, news, ...updateFields } = req.body;
    const updated = await AppData.findOneAndUpdate(
      { key: 'main' },
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    setAppData(updated); // đồng bộ cache với doc mới
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error saving app data:', error.message);
    // Vượt giới hạn 16MB của MongoDB (ảnh base64 quá lớn) → báo lỗi dễ hiểu.
    if (/larger than|too large|16793600|16777216|BSONObjectTooLarge/i.test(error.message)) {
      return res.status(413).json({
        success: false,
        message: 'Ảnh quá lớn để lưu. Vui lòng dùng ảnh nhỏ hơn.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error saving data.' });
  }
});

module.exports = router;
