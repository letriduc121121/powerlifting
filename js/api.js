// js/api.js — State Management and Backend Sync API

export const DEFAULT_DATA = {
  heroDate: '20/08/2026 – 21/08/2026',
  heroLocation: 'Thành phố Hà Nội',
  infoTimeSub: '07:00 – 18:00',
  infoLocationSub: 'Nhà thi đấu tỉnh',
  infoWeightClass: 'Nam: 59, 66, 74, 83, 93, 105, 120, +120kg',
  infoWeightClassSub: 'Nữ: 47, 52, 57, 63, 69, 76, 84, +84kg',
  infoTarget: 'Mở rộng toàn quốc',
  infoTargetSub: 'Từ 16 tuổi trở lên',
  regLink: 'https://docs.google.com/forms/d/10-Q74Dtl2qNVqGP4tAjFDO-QQaygniekPbYu-WlRG8Q/edit?hl=vi',
  introTitle: 'Powerlifting Là Gì?',
  introDesc: 'Powerlifting là bộ môn thể thao sức mạnh tối đa, thử thách giới hạn thể chất thông qua ba bài nâng cơ bản: Gánh tạ (Squat), Đẩy ngực (Bench Press) và Kéo tạ (Deadlift). Khác với cử tạ Olympic đòi hỏi kỹ thuật tốc độ cực cao, Powerlifting tập trung hoàn toàn vào sức mạnh cơ bắp thô và kỹ thuật tối ưu hóa đòn bẩy cơ thể. Mỗi vận động viên có 3 lượt thực hiện cho mỗi bài nâng để tìm ra mức tạ tối đa (1RM) cao nhất của mình.',
  images: {
    logo: '/images/logo.png',
    heroBg: '/images/hero-bg-v2.png',
    newsFallback: '/images/news-fallback.png',
    videoFallback: '/images/video-fallback.png',
    chatbotLogo: '/images/chatbot-logo.png'
  },
  prizes: {
    gold: { title: 'Vô Địch', amount: '5.000.000đ', desc: 'Mỗi hạng cân' },
    silver: { title: 'Á Quân', amount: '3.000.000đ', desc: 'Mỗi hạng cân' },
    bronze: { title: 'Hạng Ba', amount: '1.500.000đ', desc: 'Mỗi hạng cân' }
  },
  events: [
    { id: 1, name: 'SQUAT', icon: '🦵', desc: 'Bài thi đòi hỏi sức mạnh đùi và lưng dưới. VĐV phải xuống thấp qua song song và đứng lên hoàn toàn.' },
    { id: 2, name: 'BENCH PRESS', icon: '💪', desc: 'Bài thi sức mạnh ngực và tay. VĐV nằm ngửa, hạ tạ xuống ngực và đẩy lên thẳng tay.' },
    { id: 3, name: 'DEADLIFT', icon: '🏋️', desc: 'Bài thi tổng hợp sức mạnh toàn thân. VĐV nâng tạ từ sàn lên tư thế đứng thẳng hoàn toàn.' }
  ],
  beginnerRoadmap: [
    { id: 1, week: 'Tuần 1–2', title: 'Nền Tảng Kỹ Thuật', content: 'Học và luyện kỹ thuật cơ bản cho cả 3 bài. Trọng lượng nhẹ, tập trung form. 3 buổi/tuần.' },
    { id: 2, week: 'Tuần 3–4', title: 'Xây Nền Sức Mạnh', content: 'Tăng dần trọng lượng 5–10% mỗi tuần. Thêm các bài phụ trợ: Romanian Deadlift, Paused Squat.' },
    { id: 3, week: 'Tuần 5–6', title: 'Tập Ngưỡng Cao', content: 'Tăng cường độ lên 80–90% 1RM. Làm quen với cảm giác tải nặng.' },
    { id: 4, week: 'Tuần 7–8', title: 'Peaking & Thử Mức', content: 'Giảm khối lượng, tăng cường độ. Thử 1RM. Chuẩn bị openers cho ngày thi đấu.' }
  ],
  tournamentRoadmap: [
    { id: 1, week: 'Tuần 1–2', title: 'Nền Tảng', content: 'Ôn luyện kỹ thuật, đặt trọng lượng opener hợp lý cho từng bài.' },
    { id: 2, week: 'Tuần 3–4', title: 'Accumulation', content: 'Tăng khối lượng tập, 3–5 set x 3–5 reps ở 75–80% 1RM.' },
    { id: 3, week: 'Tuần 5–6', title: 'Intensification', content: 'Giảm số set, tăng % tạ lên 85–92%. Tập kỹ với lệnh trọng tài.' },
    { id: 4, week: 'Tuần 7', title: 'Peaking', content: 'Test mức tạ opener, secondary, thứ 3. Nghỉ đủ giấc, tối ưu dinh dưỡng.' },
    { id: 5, week: 'Tuần 8', title: 'Deload & Thi đấu', content: 'Tập nhẹ 2–3 ngày đầu, dừng 2–3 ngày trước thi. Ngủ đủ, cân nước hợp lý.' }
  ]
};

export const ALL_TAGS = [
  'Lộ trình tập cho người mới',
  'Squat',
  'Bench Press',
  'Deadlift',
  'Dinh dưỡng',
  'Phục hồi',
  'Trang thiết bị',
  'Kỹ thuật nâng cao'
];

export const NEWS_CATEGORIES = ['TẤT CẢ', 'THÔNG BÁO', 'KẾT QUẢ', 'VĐV NỔI BẬT', 'HƯỚNG DẪN', 'SỰ KIỆN'];

// State variables
export let appData = { ...DEFAULT_DATA };
export let appVideos = [];
export let appNews = [];
export let isAdmin = false;

// Pagination & Filter States
export const state = {
  currentNewsPage: 1,
  newsItemsPerPage: 6,
  currentVideoPage: 1,
  videoItemsPerPage: 6,
  currentVideoStatsPage: 1,
  videoStatsItemsPerPage: 5,
  currentNewsStatsPage: 1,
  newsStatsItemsPerPage: 5,
  activeNewsCategory: 'TẤT CẢ',
  newsSearchQuery: '',
  activeVideoTag: 'all',
  
  // Session tracking
  viewedVideosThisSession: new Set(),
  readNewsThisSession: new Set(),
  
  // Admin temp states
  currentEditId: null,
  currentRoadmapTarget: 'beginner',
  currentHeroKey: null,
  pendingTagsForVideo: [],
  videoSrcMode: 'url',
  localVideoBlob: null,
  pendingVideoThumbnail: '',
  pendingNewsImage: ''
};

export const API_URL = window.location.port === '5000' ? '/api' : 'http://127.0.0.1:5000/api';

export function deepMerge(target, source) {
  if (!source) return target;
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function loadData() {
  try {
    const [dataRes, videosRes, newsRes] = await Promise.all([
      fetch(`${API_URL}/data`),
      fetch(`${API_URL}/videos`),
      fetch(`${API_URL}/news`)
    ]);
    
    if (dataRes.ok) {
      const result = await dataRes.json();
      if (result.success && result.data) {
        deepMerge(appData, DEFAULT_DATA);
        deepMerge(appData, result.data);
      }
    }
    if (videosRes.ok) {
      const result = await videosRes.json();
      if (result.success && result.data) {
        appVideos.length = 0;
        appVideos.push(...result.data);
      }
    }
    if (newsRes.ok) {
      const result = await newsRes.json();
      if (result.success && result.data) {
        appNews.length = 0;
        appNews.push(...result.data);
      }
    }
    
    localStorage.setItem('plhp2026', JSON.stringify({appData, appVideos, appNews}));
    console.log('App data synchronized from MongoDB.');
    return;
  } catch (error) {
    console.warn('Cannot connect to API. Falling back to local storage.', error);
    if (window.location.protocol === 'file:') {
      alert('⚠️ CẢNH BÁO: Bạn đang mở trang web bằng giao thức file (file://) trực tiếp từ thư mục.\nTrình duyệt sẽ chặn toàn bộ kết nối (CORS) tới Server/Database.\nVui lòng truy cập trang web thông qua địa chỉ: http://localhost:5000 (hoặc http://127.0.0.1:5000) để tải và sửa dữ liệu từ Database!');
    }
  }

  // Local Storage Fallback
  const saved = localStorage.getItem('plhp2026');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      deepMerge(appData, DEFAULT_DATA);
      if (parsed.appData) deepMerge(appData, parsed.appData);
      
      appVideos.length = 0;
      if (parsed.appVideos) appVideos.push(...parsed.appVideos);
      
      appNews.length = 0;
      if (parsed.appNews) appNews.push(...parsed.appNews);
      
      console.log('App data loaded from LocalStorage fallback.');
      return;
    } catch (e) {
      console.error('Failed to parse local storage fallback:', e);
    }
  }
}

export async function saveData() {
  const toSave = { ...appData };
  localStorage.setItem('plhp2026', JSON.stringify({appData: toSave, appVideos, appNews}));

  if (isAdmin) {
    try {
      const response = await fetch(`${API_URL}/data`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toSave)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('App data successfully updated in MongoDB.');
        } else {
          alert('Lỗi từ server khi lưu dữ liệu cấu hình: ' + (result.message || 'Không xác định'));
        }
      } else {
        alert('Lỗi lưu dữ liệu cấu hình vào Database (Mã lỗi: ' + response.status + ')');
      }
    } catch (error) {
      console.error('saveData request failed:', error);
      alert('Lỗi kết nối server khi lưu dữ liệu cấu hình: ' + error.message);
    }
  }
}

export async function checkAuthStatus() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    setAdminMode(false);
    return;
  }
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        setAdminMode(true);
        console.log(`Admin session restored: ${result.username}`);
        return;
      }
    }
    console.warn('Admin token is invalid or expired.');
    localStorage.removeItem('admin_token');
    setAdminMode(false);
  } catch (error) {
    console.warn('Unable to verify token with server (server might be down), using local token validation.', error);
    setAdminMode(true);
  }
}

export function setAdminMode(logged) {
  isAdmin = logged;
  const navImgConfigBtn = document.getElementById('navImgConfigBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const adminStatsSec = document.getElementById('adminStatsSection');
  const navAdminStats = document.getElementById('navAdminStats');
  
  if (logged) {
    document.body.classList.add('admin-logged');
    const badge = document.getElementById('adminBadge');
    if (badge) badge.style.display = 'inline-block';
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.style.display = 'none';
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) addVideoBtn.style.display = 'inline-flex';
    const regLinkAdmin = document.getElementById('regLinkAdmin');
    if (regLinkAdmin) regLinkAdmin.style.display = 'block';
    
    if (navImgConfigBtn) navImgConfigBtn.style.display = 'inline-flex';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
    if (navAdminStats) navAdminStats.style.display = 'block';
    if (adminStatsSec) {
      adminStatsSec.style.display = 'block';
      import('./home.js').then(module => module.renderAdminStats());
    }
  } else {
    document.body.classList.remove('admin-logged');
    const badge = document.getElementById('adminBadge');
    if (badge) badge.style.display = 'none';
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.style.display = 'inline-block';
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) addVideoBtn.style.display = 'none';
    const regLinkAdmin = document.getElementById('regLinkAdmin');
    if (regLinkAdmin) regLinkAdmin.style.display = 'none';
    
    if (navImgConfigBtn) navImgConfigBtn.style.display = 'none';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    if (navAdminStats) navAdminStats.style.display = 'none';
    if (adminStatsSec) adminStatsSec.style.display = 'none';
  }
}
