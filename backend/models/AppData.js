// backend/models/AppData.js — App global details configuration Schema

const mongoose = require('mongoose');

const AppDataSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  heroDate: { type: String, default: '20/08/2026 – 21/08/2026' },
  heroLocation: { type: String, default: 'Thành phố Hà Nội' },
  infoTimeSub: { type: String, default: '07:00 – 18:00' },
  infoLocationSub: { type: String, default: 'Nhà thi đấu tỉnh' },
  infoWeightClass: { type: String, default: 'Nam: 59, 66, 74, 83, 93, 105, 120, +120kg' },
  infoWeightClassSub: { type: String, default: 'Nữ: 47, 52, 57, 63, 69, 76, 84, +84kg' },
  infoTarget: { type: String, default: 'Mở rộng toàn quốc' },
  infoTargetSub: { type: String, default: 'Từ 16 tuổi trở lên' },
  regLink: { type: String, default: 'https://docs.google.com/forms/d/10-Q74Dtl2qNVqGP4tAjFDO-QQaygniekPbYu-WlRG8Q/edit?hl=vi' },
  introTitle: { type: String, default: 'Powerlifting Là Gì?' },
  introDesc: { type: String, default: 'Powerlifting là bộ môn thể thao sức mạnh tối đa, thử thách giới hạn thể chất thông qua ba bài nâng cơ bản: Gánh tạ (Squat), Đẩy ngực (Bench Press) và Kéo tạ (Deadlift). Khác với cử tạ Olympic đòi hỏi kỹ thuật tốc độ cực cao, Powerlifting tập trung hoàn toàn vào sức mạnh cơ bắp thô và kỹ thuật tối ưu hóa đòn bẩy cơ thể. Mỗi vận động viên có 3 lượt thực hiện cho mỗi bài nâng để tìm ra mức tạ tối đa (1RM) cao nhất của mình.' },
  images: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      logo: '/images/logo.png',
      heroBg: '/images/hero-bg-v2.png',
      newsFallback: '/images/news-fallback.png',
      videoFallback: '/images/video-fallback.png',
      chatbotLogo: '/images/chatbot-logo.png'
    }
  },
  prizes: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      gold: { title: 'Vô Địch', amount: '5.000.000đ', desc: 'Mỗi hạng cân' },
      silver: { title: 'Á Quân', amount: '3.000.000đ', desc: 'Mỗi hạng cân' },
      bronze: { title: 'Hạng Ba', amount: '1.500.000đ', desc: 'Mỗi hạng cân' }
    }
  },
  events: { type: Array, default: [] },
  beginnerRoadmap: { type: Array, default: [] },
  tournamentRoadmap: { type: Array, default: [] }
});

module.exports = mongoose.model('AppData', AppDataSchema);
