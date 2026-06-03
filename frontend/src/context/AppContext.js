import React, { createContext, useContext, useReducer, useEffect } from "react";
import { configAPI, authAPI, statsAPI } from "../services/api";

const AppContext = createContext(null);

const initialState = {
  // Auth
  isAdmin: false,
  token: localStorage.getItem("pl_token") || null,

  // Config fields (editable content)
  config: {
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
    statClasses: "12",
    statEvents: "3",
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

  // Kiểm tra token hiện tại
  useEffect(() => {
    if (state.token) {
      dispatch({ type: "LOGIN", payload: state.token });
    }
  }, []);

  // Actions
  const actions = {
    login: async (username, password) => {
      const res = await authAPI.login(username, password);
      const { token } = res.data;
      localStorage.setItem("pl_token", token);
      dispatch({ type: "LOGIN", payload: token });
      return res.data;
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

    updateImages: async (key, value) => {
      dispatch({ type: "SET_IMAGES", payload: { [key]: value } });
      await import("../services/api").then(({ imageAPI }) =>
        imageAPI.updateConfig(key, value)
      );
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