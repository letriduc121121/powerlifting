import React from "react";
import { AppProvider } from "./context/AppContext";
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