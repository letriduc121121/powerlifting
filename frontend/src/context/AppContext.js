import React, { createContext, useContext, useReducer, useEffect } from "react";
import { configAPI, authAPI, statsAPI } from "../services/api";

const AppContext = createContext(null);

const initialState = {
  // Auth
  isAdmin: false,
  token: localStorage.getItem("pl_token") || null,

  // Config fields (editable content)
  config: {
    heroEyebrow: "Giải Đấu Chính Thức 2026",
    heroTitleTop: "POWER",
    heroTitleMid: "LIFTING",
    heroTitleBottom: "2026",
    heroSubtitle: "Nơi những người mạnh nhất tranh tài",
    heroDate: "20/08/2026 – 21/08/2026",
    heroLocation: "Thành phố Hà Nội",
    introTitle: "Powerlifting Là Gì?",
    introDesc:
      "Powerlifting là bộ môn thể thao sức mạnh tối đa, thử thách giới hạn thể chất thông qua ba bài nâng cơ bản: Gánh tạ (Squat), Đẩy ngực (Bench Press) và Kéo tạ (Deadlift).",
    infoTimeSub: "07:00 – 18:00",
    infoLocationSub: "Nhà thi đấu tỉnh",
    infoWeightClass: "Nam: 59, 66, 74, 83, 93, 105, 120, +120kg",
    infoWeightClassSub: "Nữ: 47, 52, 57, 63, 69, 76, 84, +84kg",
    infoTarget: "Mở rộng toàn quốc",
    infoTargetSub: "Từ 16 tuổi trở lên",
    regLink: "#",
    statAthletes: "200+",
    statAthletesLabel: "VĐV đăng ký",
    statClasses: "12",
    statClassesLabel: "Hạng Cân",
    statEvents: "3",
    statEventsLabel: "Nội Dung Thi",
    // Footer
    footerSlogan:
      "Giải Powerlifting chính thức tại Hà Nội, Việt Nam. Nơi những người mạnh nhất tranh tài.",
    contactEmail: "plchampionship2026@gmail.com",
    contactPhone: "0901 234 567",
    contactAddress: "Hà Nội, Việt Nam",
    mapLat: 21.0127,
    mapLng: 105.5259,
    mapEmbedUrl: "https://maps.google.com/maps?q=21.0127,105.5259&z=16&output=embed",
  },

  // Images config
  images: {
    logo: "/images/logo.png",
    heroBg: "",
    chatbotLogo: "/images/chatbot-logo.png",
    newsFallback: "",
    videoFallback: "",
  },

  // Stats (admin only)
  stats: { totalVideoViews: 0, totalNewsViews: 0, videos: [], news: [] },

  // Modal state
  modal: null, // null | 'login' | 'editField' | 'addEvent' | 'addRoadmap' | 'addVideo' | 'addNews' | 'prizes' | 'regLink' | 'newsDetail' | 'videoViewer' | 'imageConfig'
  modalData: null, // dữ liệu truyền vào modal (khi edit)
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isAdmin: true, token: action.payload };

    case "LOGOUT":
      return { ...state, isAdmin: false, token: null };

    case "SET_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } };

    case "SET_IMAGES":
      return { ...state, images: { ...state.images, ...action.payload } };

    case "SET_STATS":
      return { ...state, stats: action.payload };

    case "OPEN_MODAL":
      return { ...state, modal: action.payload.name, modalData: action.payload.data || null };

    case "CLOSE_MODAL":
      return { ...state, modal: null, modalData: null };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Khởi tạo: load config từ API
  useEffect(() => {
    configAPI
      .getAll()
      .then((res) => {
        if (res.data) dispatch({ type: "SET_CONFIG", payload: res.data.config || {} });
        if (res.data?.images) dispatch({ type: "SET_IMAGES", payload: res.data.images });
      })
      .catch(() => {
        // Fallback: dùng default state nếu API chưa sẵn sàng
      });
  }, []);

  // Xác minh token với server khi tải trang; token hỏng/hết hạn → tự đăng xuất.
  useEffect(() => {
    if (!state.token) return;
    authAPI
      .verify()
      .then(() => dispatch({ type: "LOGIN", payload: state.token }))
      .catch(() => {
        localStorage.removeItem("pl_token");
        dispatch({ type: "LOGOUT" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gắn class lên <body> để CSS hiện/ẩn các nút chỉnh sửa của admin.
  useEffect(() => {
    document.body.classList.toggle("admin-logged", state.isAdmin);
  }, [state.isAdmin]);

  // Actions
  const actions = {
    login: async (username, password) => {
      const { token } = await authAPI.login(username, password); // backend: { success, token }
      localStorage.setItem("pl_token", token);
      dispatch({ type: "LOGIN", payload: token });
      return token;
    },

    logout: async () => {
      try { await authAPI.logout(); } catch (_) {}
      localStorage.removeItem("pl_token");
      dispatch({ type: "LOGOUT" });
    },

    updateConfig: async (key, value) => {
      dispatch({ type: "SET_CONFIG", payload: { [key]: value } });
      await configAPI.update(key, value);
    },

    // Lưu nhiều field config cùng lúc (vd: chọn vị trí map → lat + lng + embedUrl)
    updateConfigMany: async (fields) => {
      dispatch({ type: "SET_CONFIG", payload: fields });
      await configAPI.updateMany(fields);
    },

    updateImages: async (key, value) => {
      const prev = state.images[key];
      dispatch({ type: "SET_IMAGES", payload: { [key]: value } });
      try {
        const { imageAPI } = await import("../services/api");
        await imageAPI.updateConfig(key, value);
      } catch (err) {
        // Lưu thất bại (vd ảnh quá lớn) → hoàn tác & báo lỗi, tránh crash overlay.
        dispatch({ type: "SET_IMAGES", payload: { [key]: prev } });
        alert(err?.response?.data?.message || "Lưu ảnh thất bại. Vui lòng thử ảnh nhỏ hơn.");
      }
    },

    loadStats: async () => {
      const res = await statsAPI.get();
      dispatch({ type: "SET_STATS", payload: res.data });
    },

    openModal: (name, data = null) =>
      dispatch({ type: "OPEN_MODAL", payload: { name, data } }),

    closeModal: () => dispatch({ type: "CLOSE_MODAL" }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp phải dùng trong AppProvider");
  return ctx;
}

export default AppContext;