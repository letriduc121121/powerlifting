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