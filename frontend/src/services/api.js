import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Tự động gắn token vào header nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pl_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự đăng xuất khi token hết hạn / không hợp lệ (bỏ qua chính request đăng nhập
// để màn hình login còn hiển thị được thông báo "sai tài khoản/mật khẩu").
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("pl_token");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ─── AppData (1 document 'main' chứa config, ảnh, giải thưởng, nội dung, lộ trình) ─
// Nhiều phần (config, events, prizes, 2 lộ trình) cùng cần document này. Thay vì
// gọi /data nhiều lần, ta cache lại + gộp các request đồng thời vào 1 promise duy
// nhất → chỉ 1 lượt mạng khi tải trang. Cache tự làm mới khi admin chỉnh sửa.
let appDataCache = null;
let appDataPromise = null;

const getAppData = ({ force = false } = {}) => {
  if (!force && appDataCache) return Promise.resolve(appDataCache);
  if (!force && appDataPromise) return appDataPromise;
  appDataPromise = api
    .get("/data")
    .then((r) => {
      appDataCache = r.data?.data || {};
      appDataPromise = null;
      return appDataCache;
    })
    .catch((e) => {
      appDataPromise = null;
      throw e;
    });
  return appDataPromise;
};

const patchAppData = (fields) =>
  api.put("/data", fields).then((r) => {
    appDataCache = r.data?.data || appDataCache; // cập nhật cache theo doc mới
    return appDataCache;
  });

// Gộp các GET trùng nhau đang cùng "bay" vào 1 request (chống gọi lặp khi
// component re-render / StrictMode mount đôi). Promise tự xoá khi xong nên lần
// tải sau vẫn lấy dữ liệu mới.
const inflight = {};
const dedupeGet = (url, transform = (x) => x) => {
  if (inflight[url]) return inflight[url];
  inflight[url] = api
    .get(url)
    .then((r) => {
      delete inflight[url];
      return transform(r.data?.data || []);
    })
    .catch((e) => {
      delete inflight[url];
      throw e;
    });
  return inflight[url];
};

// ─── AUTH (bảng admins) ─────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }).then((r) => r.data),
  logout: () => Promise.resolve(),
};

// ─── CONFIG + IMAGES (nằm trong AppData) ─────────────────────────────────────────
const CONFIG_FIELDS = [
  "heroDate", "heroLocation", "infoTimeSub", "infoLocationSub", "infoWeightClass",
  "infoWeightClassSub", "infoTarget", "infoTargetSub", "regLink", "introTitle",
  "introDesc", "statAthletes", "statClasses", "statEvents",
];
export const configAPI = {
  getAll: async () => {
    const d = await getAppData();
    const config = {};
    CONFIG_FIELDS.forEach((k) => {
      if (d[k] !== undefined) config[k] = d[k];
    });
    return { data: { config, images: d.images || {} } };
  },
  update: (key, value) => patchAppData({ [key]: value }),
};

export const imageAPI = {
  updateConfig: async (key, value) => {
    const d = await getAppData();
    return patchAppData({ images: { ...(d.images || {}), [key]: value } });
  },
};

// ─── VIDEOS (bảng videos) ────────────────────────────────────────────────────────
export const videoAPI = {
  getAll: () => dedupeGet("/videos").then((data) => ({ data })),
  create: (data) => api.post("/videos", data).then((r) => r.data?.data),
  update: (id, data) => api.put(`/videos/${id}`, data).then((r) => r.data?.data),
  delete: (id) => api.delete(`/videos/${id}`),
  incrementView: (id) =>
    api.post("/views/increment", { itemType: "video", itemId: id }),
};

// ─── NEWS (bảng news) — chuẩn hoá cat↔category, date↔createdAt ───────────────────
const normalizeNews = (n) => ({ ...n, category: n.cat ?? n.category, createdAt: n.date });
const denormalizeNews = (data) => {
  const { category, createdAt, ...rest } = data;
  return { ...rest, cat: category ?? data.cat, date: createdAt ?? data.date };
};
export const newsAPI = {
  getAll: () =>
    dedupeGet("/news", (arr) => arr.map(normalizeNews)).then((data) => ({ data })),
  create: (data) => api.post("/news", denormalizeNews(data)).then((r) => r.data?.data),
  update: (id, data) =>
    api.put(`/news/${id}`, denormalizeNews(data)).then((r) => r.data?.data),
  delete: (id) => api.delete(`/news/${id}`),
  incrementView: (id) =>
    api.post("/views/increment", { itemType: "news", itemId: id }),
};

// ─── EVENTS / ROADMAP / PRIZES (mảng/đối tượng bên trong AppData) ────────────────
export const eventAPI = {
  getAll: async () => ({ data: (await getAppData()).events || [] }),
  create: async (data) => {
    const d = await getAppData();
    return patchAppData({ events: [...(d.events || []), { ...data, id: Date.now() }] });
  },
  update: async (id, data) => {
    const d = await getAppData();
    const events = (d.events || []).map((e) =>
      String(e.id) === String(id) ? { ...e, ...data } : e
    );
    return patchAppData({ events });
  },
  delete: async (id) => {
    const d = await getAppData();
    return patchAppData({
      events: (d.events || []).filter((e) => String(e.id) !== String(id)),
    });
  },
};

const roadmapKey = (type) => `${type || "tournament"}Roadmap`; // beginnerRoadmap | tournamentRoadmap
export const roadmapAPI = {
  getAll: async (type) => ({ data: (await getAppData())[roadmapKey(type)] || [] }),
  create: async (data) => {
    const d = await getAppData();
    const key = roadmapKey(data.type);
    return patchAppData({ [key]: [...(d[key] || []), { ...data, id: Date.now() }] });
  },
  update: async (id, data) => {
    const d = await getAppData();
    const key = roadmapKey(data.type);
    const list = (d[key] || []).map((s) =>
      String(s.id) === String(id) ? { ...s, ...data } : s
    );
    return patchAppData({ [key]: list });
  },
  delete: async (id) => {
    const d = await getAppData();
    for (const key of ["beginnerRoadmap", "tournamentRoadmap"]) {
      if ((d[key] || []).some((s) => String(s.id) === String(id))) {
        return patchAppData({
          [key]: d[key].filter((s) => String(s.id) !== String(id)),
        });
      }
    }
  },
};

export const prizeAPI = {
  getAll: async () => ({ data: (await getAppData()).prizes || null }),
  update: (prizes) => patchAppData({ prizes }),
};

// ─── STATS (admin) — tổng hợp từ news + videos ──────────────────────────────────
export const statsAPI = {
  get: async () => {
    const [nv, vv] = await Promise.all([api.get("/news"), api.get("/videos")]);
    const news = (nv.data?.data || []).map(normalizeNews);
    const videos = vv.data?.data || [];
    return {
      data: {
        videos,
        news,
        totalVideoViews: videos.reduce((s, v) => s + (v.views || 0), 0),
        totalNewsViews: news.reduce((s, n) => s + (n.views || 0), 0),
      },
    };
  },
};

export default api;
