import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Hero() {
  const { state, actions } = useApp();
  const { isAdmin, config, images } = state;

  const openEdit = (key, title, isTextarea = false) => {
    if (!isAdmin) return;
    actions.openModal("editField", { key, title, value: config[key], isTextarea });
  };

  // Nút bút chì chỉnh sửa (chỉ hiện với admin)
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
            <div className="hero-eyebrow field-wrap">
              <span className="editable-field">{config.heroEyebrow}</span>
              <Pencil field="heroEyebrow" title="Chỉnh sửa Nhãn giải đấu" />
            </div>

            <h1 className="hero-title">
              <span className="field-wrap">
                {config.heroTitleTop}
                <Pencil field="heroTitleTop" title="Chỉnh sửa Tiêu đề dòng 1" />
              </span>
              <br />
              <span className="field-wrap accent">
                {config.heroTitleMid}
                <Pencil field="heroTitleMid" title="Chỉnh sửa Tiêu đề dòng 2" />
              </span>
              <br />
              <span className="field-wrap">
                {config.heroTitleBottom}
                <Pencil field="heroTitleBottom" title="Chỉnh sửa Tiêu đề dòng 3" />
              </span>
            </h1>

            <p className="hero-subtitle field-wrap">
              <span className="editable-field">{config.heroSubtitle}</span>
              <Pencil field="heroSubtitle" title="Chỉnh sửa Khẩu hiệu" />
            </p>

            <div className="hero-meta">
              {/* Date */}
              <div className="hero-meta-item">
                <span className="icon">
                  <Calendar className="w-5 h-5 text-[#ffd600]" />
                </span>
                <span className="field-wrap">
                  <span className="editable-field">{config.heroDate}</span>
                  <Pencil field="heroDate" title="Chỉnh sửa Thời gian" />
                </span>
              </div>

              {/* Location */}
              <div className="hero-meta-item">
                <span className="icon">
                  <MapPin className="w-5 h-5 text-[#ffd600]" />
                </span>
                <span className="field-wrap">
                  <span className="editable-field">{config.heroLocation}</span>
                  <Pencil field="heroLocation" title="Chỉnh sửa Địa điểm" />
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
              <span className="num field-wrap">
                {config.statAthletes}
                <Pencil field="statAthletes" title="Chỉnh sửa Số VĐV" />
              </span>
              <span className="lbl field-wrap">
                {config.statAthletesLabel}
                <Pencil field="statAthletesLabel" title="Chỉnh sửa Nhãn số VĐV" />
              </span>
            </div>
            <div className="stat-box">
              <span className="num field-wrap">
                {config.statClasses}
                <Pencil field="statClasses" title="Chỉnh sửa Số hạng cân" />
              </span>
              <span className="lbl field-wrap">
                {config.statClassesLabel}
                <Pencil field="statClassesLabel" title="Chỉnh sửa Nhãn hạng cân" />
              </span>
            </div>
            <div className="stat-box">
              <span className="num field-wrap">
                {config.statEvents}
                <Pencil field="statEvents" title="Chỉnh sửa Số nội dung" />
              </span>
              <span className="lbl field-wrap">
                {config.statEventsLabel}
                <Pencil field="statEventsLabel" title="Chỉnh sửa Nhãn nội dung" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
