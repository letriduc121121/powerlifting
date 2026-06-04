import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Hero() {
  const { state, actions } = useApp();
  const { isAdmin, config, images } = state;

  const openEdit = (key, title) => {
    if (!isAdmin) return;
    actions.openModal("editField", { key, title, value: config[key] });
  };

  const handleNavClick = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="hero"
      style={
        images.heroBg
          ? {
              backgroundImage: `url(${images.heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      <div className="container">
        <div className="hero-layout">
          {/* Left: Content */}
          <div className="hero-content">
            <div className="hero-eyebrow">Giải Đấu Chính Thức 2026</div>
            <h1 className="hero-title">
              POWER<br />
              <span className="accent">LIFTING</span>
              <br />2026
            </h1>
            <p className="hero-subtitle">Nơi những người mạnh nhất tranh tài</p>

            <div className="hero-meta">
              {/* Date */}
              <div className="hero-meta-item">
                <span className="icon">
                  <Calendar className="w-5 h-5 text-[#ffd600]" />
                </span>
                <span className="field-wrap">
                  <span className="editable-field">{config.heroDate}</span>
                  {isAdmin && (
                    <button
                      className="field-edit-icon"
                      onClick={() => openEdit("heroDate", "Chỉnh sửa Thời gian")}
                    >
                      ✏️
                    </button>
                  )}
                </span>
              </div>

              {/* Location */}
              <div className="hero-meta-item">
                <span className="icon">
                  <MapPin className="w-5 h-5 text-[#ffd600]" />
                </span>
                <span className="field-wrap">
                  <span className="editable-field">{config.heroLocation}</span>
                  {isAdmin && (
                    <button
                      className="field-edit-icon"
                      onClick={() => openEdit("heroLocation", "Chỉnh sửa Địa điểm")}
                    >
                      ✏️
                    </button>
                  )}
                </span>
              </div>
            </div>

            <div className="hero-actions">
              <a
                href="#giai-dau"
                className="btn btn-yellow"
                onClick={(e) => { e.preventDefault(); handleNavClick("#giai-dau"); }}
              >
                Xem Giải Đấu
              </a>
              <a
                href="#huong-dan"
                className="btn btn-outline-white"
                onClick={(e) => { e.preventDefault(); handleNavClick("#huong-dan"); }}
              >
                Hướng Dẫn
              </a>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="hero-right">
            <div className="stat-box">
              <span className="num">{config.statAthletes}</span>
              <span className="lbl">VĐV đăng ký</span>
            </div>
            <div className="stat-box">
              <span className="num">{config.statClasses}</span>
              <span className="lbl">Hạng Cân</span>
            </div>
            <div className="stat-box">
              <span className="num">{config.statEvents}</span>
              <span className="lbl">Nội Dung Thi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}