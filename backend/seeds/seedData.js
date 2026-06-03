// backend/seeds/seedData.js

const AppData = require('../models/AppData');
const Video   = require('../models/Video');
const News    = require('../models/News');

// ── Default seed values ───────────────────────────────────────────────────────
const defaults = {
  heroDate:        '20/08/2026 – 21/08/2026',
  heroLocation:    'Thành phố Hà Nội',
  infoTimeSub:     '07:00 – 18:00',
  infoLocationSub: 'Nhà thi đấu tỉnh',
  infoWeightClass:    'Nam: 59, 66, 74, 83, 93, 105, 120, +120kg',
  infoWeightClassSub: 'Nữ: 47, 52, 57, 63, 69, 76, 84, +84kg',
  infoTarget:    'Mở rộng toàn quốc',
  infoTargetSub: 'Từ 16 tuổi trở lên',
  regLink: 'https://docs.google.com/forms/d/10-Q74Dtl2qNVqGP4tAjFDO-QQaygniekPbYu-WlRG8Q/edit?hl=vi',
  introTitle: 'Powerlifting Là Gì?',
  introDesc:  'Powerlifting là bộ môn thể thao sức mạnh tối đa, thử thách giới hạn thể chất thông qua ba bài nâng cơ bản: Gánh tạ (Squat), Đẩy ngực (Bench Press) và Kéo tạ (Deadlift). Khác với cử tạ Olympic đòi hỏi kỹ thuật tốc độ cực cao, Powerlifting tập trung hoàn toàn vào sức mạnh cơ bắp thô và kỹ thuật tối ưu hóa đòn bẩy cơ thể. Mỗi vận động viên có 3 lượt thực hiện cho mỗi bài nâng để tìm ra mức tạ tối đa (1RM) cao nhất của mình.',
  images: {
    logo:          '/images/logo.png',
    heroBg:        '/images/hero-bg-v2.png',
    newsFallback:  '/images/news-fallback.png',
    videoFallback: '/images/video-fallback.png',
    chatbotLogo:   '/images/chatbot-logo.png',
  },
  prizes: {
    gold:   { title: 'Vô Địch', amount: '5.000.000đ', desc: 'Mỗi hạng cân' },
    silver: { title: 'Á Quân',  amount: '3.000.000đ', desc: 'Mỗi hạng cân' },
    bronze: { title: 'Hạng Ba', amount: '1.500.000đ', desc: 'Mỗi hạng cân' },
  },
  events: [
    { id: 1, name: 'SQUAT',       icon: '🦵', desc: 'Bài thi đòi hỏi sức mạnh đùi và lưng dưới. VĐV phải xuống thấp qua song song và đứng lên hoàn toàn.' },
    { id: 2, name: 'BENCH PRESS', icon: '💪', desc: 'Bài thi sức mạnh ngực và tay. VĐV nằm ngửa, hạ tạ xuống ngực và đẩy lên thẳng tay.' },
    { id: 3, name: 'DEADLIFT',    icon: '🏋️', desc: 'Bài thi tổng hợp sức mạnh toàn thân. VĐV nâng tạ từ sàn lên tư thế đứng thẳng hoàn toàn.' },
  ],
  beginnerRoadmap: [
    { id: 1, week: 'Tuần 1–2', title: 'Nền Tảng Kỹ Thuật',  content: 'Học và luyện kỹ thuật cơ bản cho cả 3 bài. Trọng lượng nhẹ, tập trung form. 3 buổi/tuần.' },
    { id: 2, week: 'Tuần 3–4', title: 'Xây Nền Sức Mạnh',   content: 'Tăng dần trọng lượng 5–10% mỗi tuần. Thêm các bài phụ trợ: Romanian Deadlift, Paused Squat.' },
    { id: 3, week: 'Tuần 5–6', title: 'Tập Ngưỡng Cao',      content: 'Tăng cường độ lên 80–90% 1RM. Làm quen với cảm giác tải nặng.' },
    { id: 4, week: 'Tuần 7–8', title: 'Peaking & Thử Mức',   content: 'Giảm khối lượng, tăng cường độ. Thử 1RM. Chuẩn bị openers cho ngày thi đấu.' },
  ],
  tournamentRoadmap: [
    { id: 1, week: 'Tuần 1–2', title: 'Nền Tảng',        content: 'Ôn luyện kỹ thuật, đặt trọng lượng opener hợp lý cho từng bài.' },
    { id: 2, week: 'Tuần 3–4', title: 'Accumulation',     content: 'Tăng khối lượng tập, 3–5 set x 3–5 reps ở 75–80% 1RM.' },
    { id: 3, week: 'Tuần 5–6', title: 'Intensification',  content: 'Giảm số set, tăng % tạ lên 85–92%. Tập kỹ với lệnh trọng tài.' },
    { id: 4, week: 'Tuần 7',   title: 'Peaking',          content: 'Test mức tạ opener, secondary, thứ 3. Nghỉ đủ giấc, tối ưu dinh dưỡng.' },
    { id: 5, week: 'Tuần 8',   title: 'Deload & Thi đấu', content: 'Tập nhẹ 2–3 ngày đầu, dừng 2–3 ngày trước thi. Ngủ đủ, cân nước hợp lý.' },
  ],
};

const defaultVideos = [
  { id: 1, name: 'Kỹ thuật Squat cơ bản',       url: 'https://www.youtube.com/embed/bEv6CCg2BC8', localBlob: null, tags: ['Squat', 'Lộ trình tập cho người mới'], views: 0 },
  { id: 2, name: 'Kỹ thuật Bench Press cơ bản', url: 'https://www.youtube.com/embed/rT7DgCr-3pg', localBlob: null, tags: ['Bench Press', 'Lộ trình tập cho người mới'], views: 0 },
  { id: 3, name: 'Kỹ thuật Deadlift cơ bản',    url: 'https://www.youtube.com/embed/op9kVnSso6Q', localBlob: null, tags: ['Deadlift', 'Lộ trình tập cho người mới'], views: 0 },
  { id: 4, name: 'Dinh dưỡng cho Powerlifter',  url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', localBlob: null, tags: ['Dinh dưỡng'], views: 0 },
];

const defaultNews = [
  {
    id: 1, cat: 'THÔNG BÁO', featured: true, views: 0, image: '',
    title: 'Mở Đăng Ký Chính Thức Powerlifting Championship 2026',
    desc:  'Đăng ký tham dự giải đấu Powerlifting lớn nhất Hà Nội từ ngày 01/06/2026. Deadline: 10/08/2026.',
    fullContent: 'Ban tổ chức giải Powerlifting Championship 2026 chính thức mở đăng ký tham dự.\n\nThời gian đăng ký: 01/06/2026 – 10/08/2026\nĐịa điểm thi đấu: Nhà thi đấu tỉnh, Hà Nội\n\nCác hạng cân: 59, 66, 74, 83, 93, 105, 120 và +120kg.\nĐối tượng: Tất cả VĐV từ 16 tuổi trở lên.\n\nVui lòng điền form đăng ký và chờ xác nhận từ BTC.',
    date: '28/05/2026',
  },
  {
    id: 2, cat: 'KẾT QUẢ', featured: false, views: 0, image: '',
    title: 'Kết Quả Giải Powerlifting Mùa Xuân 2026',
    desc:  'Nguyễn Văn A xuất sắc giành danh hiệu Best Lifter với tổng tạ 750kg ở hạng 83kg.',
    fullContent: 'Giải Powerlifting Mùa Xuân 2026 đã khép lại thành công.\n\nKết quả nổi bật:\n• Best Lifter: Nguyễn Văn A — Total 750kg (hạng 83kg)\n• Vô địch hạng 66kg: Trần Văn C — Total 520kg\n• Vô địch hạng 74kg: Lê Văn D — Total 610kg\n\nChúc mừng tất cả các VĐV đã thi đấu xuất sắc!',
    date: '15/03/2026',
  },
  {
    id: 3, cat: 'VĐV NỔI BẬT', featured: false, views: 0, image: '',
    title: 'Gặp Gỡ Trần Thị B – VĐV Nữ Đầy Triển Vọng',
    desc:  'Từ người mới bắt đầu năm 2024, Trần Thị B đã trở thành gương mặt nổi bật của Powerlifting Hà Nội.',
    fullContent: 'Trần Thị B bắt đầu tập luyện Powerlifting từ tháng 3/2024.\n\nChỉ sau 2 năm, cô đã đạt được:\n• Total: 320kg ở hạng 57kg\n• Best Squat: 130kg\n• Best Bench: 65kg\n• Best Deadlift: 145kg\n\n"Powerlifting đã thay đổi cuộc sống của tôi hoàn toàn. Tôi tự tin hơn và khoẻ mạnh hơn bao giờ hết" — Trần Thị B chia sẻ.',
    date: '10/04/2026',
  },
  {
    id: 4, cat: 'HƯỚNG DẪN', featured: false, views: 0, image: '',
    title: '5 Lỗi Kỹ Thuật Phổ Biến Người Mới Hay Mắc Phải',
    desc:  'Tổng hợp từ các HLV — tránh những lỗi này để tiến bộ nhanh hơn và tránh chấn thương.',
    fullContent: '1. Squat: Gối đẩy vào trong (knee cave) — Hãy tập trung đẩy gối ra ngoài theo hướng bàn chân.\n\n2. Bench Press: Không rút vai (retract scapula) — Kéo 2 xương bả vai lại gần nhau trước khi nằm.\n\n3. Deadlift: Lưng tròn — Giữ lưng trung tính, siết core trước khi kéo.\n\n4. Không warm-up kỹ — Luôn warm-up với tạ nhẹ trước khi vào set nặng.\n\n5. Tăng tạ quá nhanh — Tuân thủ chương trình, tăng 2.5–5kg mỗi tuần là đủ.',
    date: '05/05/2026',
  },
];

// ── Seed logic ────────────────────────────────────────────────────────────────
module.exports = async function seedData() {
  try {
    // AppData
    let appData = await AppData.findOne({ key: 'main' });
    if (!appData) {
      await AppData.create({ key: 'main', ...defaults });
      console.log('Default app data seeded.');
    } else {
      // Migrations
      const updates = {};
      if (appData.infoTimeSub === undefined) {
        Object.assign(updates, {
          infoTimeSub: defaults.infoTimeSub,
          infoLocationSub: defaults.infoLocationSub,
          infoWeightClass: defaults.infoWeightClass,
          infoWeightClassSub: defaults.infoWeightClassSub,
          infoTarget: defaults.infoTarget,
          infoTargetSub: defaults.infoTargetSub,
        });
        console.log('Migrated: new info card fields.');
      }
      if (appData.images?.heroBg === '/images/hero-bg.png') {
        updates['images.heroBg'] = '/images/hero-bg-v2.png';
        console.log('Migrated: hero background → v2.');
      }
      if (Object.keys(updates).length) {
        await AppData.updateOne({ key: 'main' }, { $set: updates });
      }
    }

    // Videos
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      await Video.insertMany(defaultVideos);
      console.log('Default videos seeded.');
    }

    // News
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      await News.insertMany(defaultNews);
      console.log('Default news seeded.');
    }
  } catch (err) {
    console.error('seedData error:', err.message);
  }
};
