import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#gioi-thieu", label: "Giới Thiệu" },
  { href: "#huong-dan", label: "Hướng Dẫn" },
  { href: "#giai-dau", label: "Giải Đấu" },
  { href: "#tin-tuc", label: "Tin Tức" },
  { href: "#dang-ky-link", label: "Tham Gia" },
];

export default function Footer() {
  const { state, actions } = useApp();
  const { images, isAdmin } = state;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div
              className="footer-logo-wrapper"
              style={{ height: 50, display: "flex", alignItems: "center", marginBottom: 16 }}
            >
              <img
                src={images.logo || "/images/logo.png"}
                alt="Powerlifting Logo"
                style={{ height: "100%", objectFit: "contain" }}
              />
            </div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, margin: "0 0 16px 0" }}>
              Giải Powerlifting chính thức tại Hà Nội, Việt Nam. Nơi những người mạnh nhất tranh tài.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">📘</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">📸</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">▶️</a>
            </div>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4>Liên Hệ</h4>
            <p>
              <Mail className="w-4 h-4 inline-block align-middle mr-1" style={{ color: "#9ca3af" }} />
              plchampionship2026@gmail.com
            </p>
            <p>
              <Phone className="w-4 h-4 inline-block align-middle mr-1" style={{ color: "#9ca3af" }} />
              0901 234 567
            </p>
            <p>
              <MapPin className="w-4 h-4 inline-block align-middle mr-1" style={{ color: "#9ca3af" }} />
              Hà Nội, Việt Nam
            </p>
          </div>

          {/* Navigation */}
          <div className="footer-navigation">
            <h4>Điều Hướng</h4>
            <div className="footer-links-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="footer-map-col">
            <h4>Bản Đồ Địa Chỉ</h4>
            <div className="footer-map-container">
              <iframe
                title="Hanoi Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.097073747585!2d105.80164807597149!3d21.02880148810793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab424a50fff9%3A0xbe22efcead54002b!2zVHJ1bmcgdMOibSBUaMO0bmcgVMOtbiBRdeG7kWMgdOG6vyBIw6AgTuG7mWk!5e0!3m2!1svi!2svn!4v1717140000000!5m2!1svi!2svn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Powerlifting Championship Hà Nội. Mọi quyền được bảo lưu.</p>
          <div className="footer-legal">
            {isAdmin ? (
              <button className="footer-admin-link" onClick={actions.logout}>
                Đăng xuất
              </button>
            ) : (
              <button
                className="footer-admin-link"
                onClick={() => actions.openModal("login")}
              >
                Quyền admin
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}