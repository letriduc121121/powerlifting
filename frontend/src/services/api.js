import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Tự động gắn token vào header nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pl_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý lỗi 401 → tự đăng xuất
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pl_token");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
};

// ─── CONFIG (hero fields, editable content) ──────────────────────────────────
export const configAPI = {
  getAll: () => api.get("/config"),
  update: (key, value) => api.put(`/config/${key}`, { value }),
  updateMany: (data) => api.put("/config", data),
};

// ─── VIDEOS ──────────────────────────────────────────────────────────────────
export const videoAPI = {
  getAll: () => api.get("/videos"),
  create: (data) => api.post("/videos", data),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
  incrementView: (id) => api.post(`/videos/${id}/view`),
};

// ─── NEWS ─────────────────────────────────────────────────────────────────────
export const newsAPI = {
  getAll: () => api.get("/news"),
  create: (data) => api.post("/news", data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
  incrementView: (id) => api.post(`/news/${id}/view`),
};

// ─── EVENTS (Nội dung thi đấu) ───────────────────────────────────────────────
export const eventAPI = {
  getAll: () => api.get("/events"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// ─── ROADMAP ─────────────────────────────────────────────────────────────────
export const roadmapAPI = {
  getAll: (type) => api.get(`/roadmap?type=${type}`), // type: 'beginner' | 'tournament'
  create: (data) => api.post("/roadmap", data),
  update: (id, data) => api.put(`/roadmap/${id}`, data),
  delete: (id) => api.delete(`/roadmap/${id}`),
};

// ─── PRIZES ──────────────────────────────────────────────────────────────────
export const prizeAPI = {
  getAll: () => api.get("/prizes"),
  update: (data) => api.put("/prizes", data), // bulk update gold/silver/bronze
};

// ─── STATS ───────────────────────────────────────────────────────────────────
export const statsAPI = {
  get: () => api.get("/stats"),
};

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  send: (message) => api.post("/chat", { message }),
};

// ─── IMAGES ──────────────────────────────────────────────────────────────────
export const imageAPI = {
  upload: (formData) =>
    api.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getConfig: () => api.get("/images/config"),
  updateConfig: (key, value) => api.put(`/images/config/${key}`, { value }),
};

export default api;