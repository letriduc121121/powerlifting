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
  const { images, isAdmin, config } = state;

  const openEdit = (key, title, isTextarea = false) => {
    if (!isAdmin) return;
    actions.openModal("editField", { key, title, value: config[key], isTextarea });
  };

  const Pencil = ({ field, title, textarea }) =>
    isAdmin ? (
      <button
        className="field-edit-icon"
        onClick={() => openEdit(field, title, textarea)}
        title={title}
      >
        ✏️
      </button>
    ) : null;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Admin có thể dán nguyên thẻ <iframe ... src="..."> hoặc chỉ URL → tự trích src.
  const mapSrc = (() => {
    const v = config.mapEmbedUrl || "";
    const m = v.match(/src=["']([^"']+)["']/i);
    return m ? m[1] : v;
  })();

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
            <p className="field-wrap" style={{ fontSize: "0.88rem", lineHeight: 1.7, margin: "0 0 16px 0" }}>
              <span className="editable-field">{config.footerSlogan}</span>
              <Pencil field="footerSlogan" title="Chỉnh sửa Khẩu hiệu" textarea />
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
            <p className="field-wrap">
              <Mail className="w-4 h-4 inline-block align-middle mr-1" style={{ color: "#9ca3af" }} />
              <span className="editable-field">{config.contactEmail}</span>
              <Pencil field="contactEmail" title="Chỉnh sửa Email" />
            </p>
            <p className="field-wrap">
              <Phone className="w-4 h-4 inline-block align-middle mr-1" style={{ color: "#9ca3af" }} />
              <span className="editable-field">{config.contactPhone}</span>
              <Pencil field="contactPhone" title="Chỉnh sửa Số điện thoại" />
            </p>
            <p className="field-wrap">
              <MapPin className="w-4 h-4 inline-block align-middle mr-1" style={{ color: "#9ca3af" }} />
              <span className="editable-field">{config.contactAddress}</span>
              <Pencil field="contactAddress" title="Chỉnh sửa Địa chỉ" />
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
            <h4 className="field-wrap">
              Bản Đồ Địa Chỉ
              {isAdmin && (
                <button
                  className="field-edit-icon"
                  onClick={() => actions.openModal("mapPicker")}
                  title="Chọn vị trí ghim bản đồ"
                >
                  📍
                </button>
              )}
            </h4>
            <div className="footer-map-container">
              <iframe
                title="Bản đồ địa điểm"
                src={mapSrc}
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
