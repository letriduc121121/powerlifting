import React, { useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import useScrollReveal from "./hooks/useScrollReveal";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Introduction from "./components/Introduction";
import Guide from "./components/Guide";
import Tournament from "./components/Tournament";
import News from "./components/News";
import AdminStats from "./components/AdminStats";
import Footer from "./components/Footer";
import Modals from "./components/Modals";
import Chatbot from "./components/Chatbot";
import "./App.css";

export default function App() {
  useScrollReveal();

  // Kích hoạt hiệu ứng xuất hiện cho navbar & hero ngay khi tải xong.
  useEffect(() => {
    document.body.classList.add("loaded");
    // Mặc định về trang chủ home khi load trang
    window.scrollTo(0, 0);
    window.location.hash = "#home";
  }, []);

  // Ping backend định kỳ để giữ backend không bị ngủ (keep-alive) khi có user mở web
  useEffect(() => {
    const pingBackend = () => {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      fetch(`${apiUrl}/health`)
        .then(() => console.log("Backend keep-alive ping sent successfully."))
        .catch((err) => console.warn("Backend keep-alive ping failed:", err.message));
    };

    // Gửi ping ngay khi vừa tải trang
    pingBackend();

    // Ping định kỳ mỗi 10 phút (600,000 ms)
    const interval = setInterval(pingBackend, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppProvider>
      <Navbar />
      <main>
        <Hero />
        <Introduction />
        <Guide />
        <Tournament />
        <News />
        <AdminStats />
      </main>
      <Footer />
      <Modals />
      <Chatbot />
    </AppProvider>
  );
}