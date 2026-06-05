// backend/utils/appDataCache.js — In-memory cache cho AppData ('main').
// AppData chứa ảnh base64 (vài MB) và chỉ đổi khi admin chỉnh sửa, nên việc fetch
// lại từ MongoDB Atlas (cloud) mỗi lần GET là điểm nghẽn chính (~1.5s/request).
// Cache trong RAM → request sau chỉ mất ~1ms. PUT sẽ cập nhật lại cache.

const AppData = require('../models/AppData');

let cache = null;

const getAppData = async () => {
  if (!cache) cache = await AppData.findOne({ key: 'main' }).lean();
  return cache;
};

const setAppData = (doc) => { cache = doc; };

module.exports = { getAppData, setAppData };
