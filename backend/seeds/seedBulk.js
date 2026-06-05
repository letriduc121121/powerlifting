// backend/seeds/seedBulk.js — Thêm 30 video + 30 tin tức (kèm lượt xem) để test hiệu năng tải dữ liệu
// Cách chạy:  node seeds/seedBulk.js          (thêm tiếp nối ID hiện có)
//             node seeds/seedBulk.js --reset  (xoá hết video/news rồi seed lại từ đầu)

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Video = require('../models/Video');
const News  = require('../models/News');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/powerlifting';
const RESET = process.argv.includes('--reset');

// ── Nguồn dữ liệu mẫu để sinh nội dung đa dạng ────────────────────────────────
const sampleEmbeds = [
  'bEv6CCg2BC8', 'rT7DgCr-3pg', 'op9kVnSso6Q', 'XxWcirHIwVo',
  'r4MzxtBKyNE', 'vmNPOjaGrVE', '1oed-UmAxFs', 'ytGaGIn3SjE',
];

const videoTopics = [
  'Kỹ thuật Squat nâng cao', 'Sửa lỗi Bench Press', 'Deadlift kiểu Sumo',
  'Khởi động trước buổi tập nặng', 'Lập trình tập luyện 5x5', 'Tăng sức mạnh core',
  'Kỹ thuật thở Valsalva', 'Chọn giày tập Powerlifting', 'Quấn gối & dây lưng đúng cách',
  'Phục hồi sau chấn thương lưng', 'Dinh dưỡng tăng cơ', 'Cách peaking trước thi đấu',
  'Mobility cho hông', 'Grip strength cho Deadlift', 'Pause Squat hiệu quả',
  'Close-grip Bench Press', 'Romanian Deadlift chuẩn form', 'Tập phụ trợ cho Bench',
  'Lộ trình 8 tuần cho người mới', 'Cách đặt opener hợp lý',
];

const videoTags = [
  ['Squat'], ['Bench Press'], ['Deadlift'], ['Dinh dưỡng'],
  ['Lộ trình tập cho người mới'], ['Squat', 'Kỹ thuật'], ['Deadlift', 'Sức mạnh'],
  ['Phục hồi'], ['Mobility'], ['Thi đấu'],
];

const newsCats = ['THÔNG BÁO', 'KẾT QUẢ', 'VĐV NỔI BẬT', 'HƯỚNG DẪN', 'TIN TỨC'];

const newsTitles = [
  'Cập nhật thể lệ giải Powerlifting 2026', 'Phỏng vấn nhà vô địch hạng 93kg',
  'Hướng dẫn cân nước trước thi đấu', 'Kết quả vòng loại khu vực miền Bắc',
  'Mẹo tăng total nhanh cho người mới', 'Lịch thi đấu chi tiết từng hạng cân',
  'Giới thiệu trọng tài quốc tế tham dự', 'Thông báo địa điểm warm-up khu vực',
  'Top 10 VĐV triển vọng năm 2026', 'Hướng dẫn đăng ký online từng bước',
  'Phân tích kỹ thuật Squat của tuyển thủ', 'Chế độ dinh dưỡng tuần thi đấu',
  'Kết quả hạng cân nữ 63kg', 'Câu chuyện vượt chấn thương của VĐV',
  'Quy định trang phục & thiết bị hỗ trợ', 'Lịch kiểm tra doping',
  'Hướng dẫn chọn opener an toàn', 'Tổng kết giải mùa hè 2026',
  'Gặp gỡ HLV trưởng đội tuyển', 'Thông báo thay đổi giờ thi đấu',
];

// Sinh chuỗi ngày dạng dd/mm/2026 một cách tất định theo index
function makeDate(i) {
  const day = (i % 28) + 1;
  const month = (i % 12) + 1;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(day)}/${pad(month)}/2026`;
}

// Lượt xem tất định nhưng trải rộng để dữ liệu trông thực tế
function makeViews(i) {
  return ((i * 9973) % 50000) + (i * 37);
}

async function run() {
  await connectDB(MONGO_URI);

  if (RESET) {
    await Video.deleteMany({});
    await News.deleteMany({});
    console.log('Đã xoá toàn bộ video & news cũ (--reset).');
  }

  // ── Videos ──────────────────────────────────────────────────────────────────
  const maxVideo = await Video.findOne().sort({ id: -1 });
  let vid = maxVideo ? maxVideo.id : 0;
  const videos = [];
  for (let i = 0; i < 30; i++) {
    vid++;
    const topic = videoTopics[i % videoTopics.length];
    videos.push({
      id: vid,
      name: `${topic} (#${vid})`,
      url: `https://www.youtube.com/embed/${sampleEmbeds[i % sampleEmbeds.length]}`,
      localBlob: null,
      thumbnail: '',
      tags: videoTags[i % videoTags.length],
      views: makeViews(i + 1),
    });
  }
  await Video.insertMany(videos);
  console.log(`Đã thêm 30 video (id ${videos[0].id}–${videos[29].id}).`);

  // ── News ────────────────────────────────────────────────────────────────────
  const maxNews = await News.findOne().sort({ id: -1 });
  let nid = maxNews ? maxNews.id : 0;
  const news = [];
  for (let i = 0; i < 30; i++) {
    nid++;
    const title = newsTitles[i % newsTitles.length];
    const cat = newsCats[i % newsCats.length];
    news.push({
      id: nid,
      title: `${title} (#${nid})`,
      cat,
      desc: `Bản tin số ${nid}: ${title}. Nội dung tóm tắt phục vụ kiểm thử hiệu năng tải dữ liệu lên giao diện.`,
      fullContent: `Đây là nội dung đầy đủ của bản tin số ${nid}.\n\n${title}.\n\nBan tổ chức cập nhật thông tin mới nhất về giải Powerlifting Championship 2026. Vui lòng theo dõi thường xuyên để không bỏ lỡ.\n\nDữ liệu này được tạo tự động để kiểm thử tốc độ truy vấn và render danh sách.`,
      date: makeDate(i),
      featured: i % 10 === 0,
      image: '',
      views: makeViews(i + 1),
    });
  }
  await News.insertMany(news);
  console.log(`Đã thêm 30 tin tức (id ${news[0].id}–${news[29].id}).`);

  const totalV = await Video.countDocuments();
  const totalN = await News.countDocuments();
  console.log(`Tổng hiện tại: ${totalV} video, ${totalN} tin tức.`);

  await mongoose.disconnect();
  console.log('Hoàn tất.');
}

run().catch((err) => {
  console.error('seedBulk error:', err);
  process.exit(1);
});
