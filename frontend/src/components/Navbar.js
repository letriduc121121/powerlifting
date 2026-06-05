import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const NAV_LINKS = [
  { href: "#home", label: "Home", sec: "home" },
  { href: "#gioi-thieu", label: "Giới Thiệu", sec: "gioi-thieu" },
  { href: "#huong-dan", label: "Hướng Dẫn", sec: "huong-dan" },
  { href: "#giai-dau", label: "Giải Đấu", sec: "giai-dau" },
  { href: "#tin-tuc", label: "Tin Tức", sec: "tin-tuc" },
];

export default function Navbar() {
  const { state, actions } = useApp();
  const { isAdmin, images } = state;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  // Scroll spy & shrink effect
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["home", "gioi-thieu", "huong-dan", "giai-dau", "tin-tuc", "adminStatsSection"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 80) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      {/* Logo */}
      <a
        href="#home"
        className="nav-logo"
        onClick={(e) => { e.preventDefault(); handleNavClick("#home"); }}
      >
        <div className="logo-wrapper">
          <img
            src={images.logo || "/images/logo.png"}
            alt="Powerlifting Logo"
            id="navLogoImg"
          />
        </div>
      </a>

      {/* Mobile toggle */}
      <button
        className={`nav-toggle${menuOpen ? " open" : ""}`}
        id="navToggle"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Nav links */}
      <ul className={`nav-links${menuOpen ? " open" : ""}`} id="navLinks">
        {NAV_LINKS.map((link) => (
          <li key={link.sec}>
            <a
              href={link.href}
              className={`nav-link${activeSection === link.sec ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
            >
              {link.label}
            </a>
          </li>
        ))}

        {/* Thống kê — chỉ admin */}
        {isAdmin && (
          <li id="navAdminStats">
            <a
              href="#adminStatsSection"
              className={`nav-link${activeSection === "adminStatsSection" ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); handleNavClick("#adminStatsSection"); }}
            >
              Thống Kê
            </a>
          </li>
        )}

        <li>
          <a
            href="#dang-ky-link"
            className="nav-link nav-cta"
            onClick={(e) => { e.preventDefault(); handleNavClick("#dang-ky-link"); }}
          >
            Tham Gia
          </a>
        </li>

        {/* Mobile: Admin logout (chỉ khi đã đăng nhập) */}
        {isAdmin && (
          <li className="mobile-only-nav-item" style={{ width: "100%" }}>
            <button
              className="login-btn-nav"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => { setMenuOpen(false); actions.logout(); }}
            >
              Đăng xuất
            </button>
          </li>
        )}
      </ul>

      {/* Desktop right side */}
      <div className="nav-right desktop-only-nav-right">
        {isAdmin && (
          <>
            <span id="adminBadge">ADMIN</span>
            <button
              className="login-btn-nav"
              style={{
                marginRight: 10,
                background: "var(--yellow)",
                color: "#0b1224",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontWeight: "bold",
              }}
              onClick={() => actions.openModal("imageConfig")}
            >
              🖼️ Ảnh &amp; Logo
            </button>
            <button
              className="login-btn-nav"
              id="logoutBtn"
              onClick={actions.logout}
            >
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </nav>
  );
}