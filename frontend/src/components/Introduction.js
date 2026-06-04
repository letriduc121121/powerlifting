import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { roadmapAPI } from "../services/api";

export default function Introduction() {
  const { state, actions } = useApp();
  const { isAdmin, config } = state;

  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roadmapAPI
      .getAll("beginner")
      .then((res) => setRoadmap(res.data || []))
      .catch(() => setRoadmap(DEFAULT_BEGINNER_ROADMAP))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (key, title, isTextarea = false) => {
    if (!isAdmin) return;
    actions.openModal("editField", { key, title, value: config[key], isTextarea });
  };

  const handleAddRoadmap = () => actions.openModal("addRoadmap", { type: "beginner", onSaved: reload });
  const handleEditRoadmap = (item) =>
    actions.openModal("addRoadmap", { type: "beginner", editItem: item, onSaved: reload });

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm("Xóa bước này?")) return;
    await roadmapAPI.delete(id);
    reload();
  };

  const reload = () => {
    roadmapAPI.getAll("beginner").then((res) => setRoadmap(res.data || []));
  };

  return (
    <>
      {/* ===== GIỚI THIỆU ===== */}
      <section
        id="gioi-thieu"
        className="intro-section"
        style={{ padding: "80px 0", background: "var(--bg-white)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }} className="reveal">
            <h2 className="section-label-lg">
              <span className="field-wrap">
                <span className="editable-field">{config.introTitle}</span>
                {isAdmin && (
                  <button
                    className="field-edit-icon"
                    onClick={() => openEdit("introTitle", "Chỉnh sửa Tiêu đề Giới thiệu")}
                  >
                    ✏️
                  </button>
                )}
              </span>
            </h2>
            <p
              className="section-desc"
              style={{ margin: "20px auto 0", fontSize: "1.05rem", lineHeight: 1.8, maxWidth: 800 }}
            >
              <span className="field-wrap">
                <span className="editable-field">{config.introDesc}</span>
                {isAdmin && (
                  <button
                    className="field-edit-icon"
                    onClick={() => openEdit("introDesc", "Chỉnh sửa Nội dung Giới thiệu", true)}
                  >
                    ✏️
                  </button>
                )}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== LỘ TRÌNH NGƯỜI MỚI ===== */}
      <section id="lo-trinh-moi" className="roadmap-hero-section">
        <div className="container">
          <div className="section-header-wrap">
            <div className="section-label-lg">Lộ Trình Cho Người Mới Bắt Đầu</div>
            {isAdmin && (
              <button className="btn btn-primary btn-sm add-card-btn" onClick={handleAddRoadmap}>
                + Thêm Bước
              </button>
            )}
          </div>

          <div className="tm-roadmap reveal" id="beginnerRoadmapCards">
            {loading ? (
              <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Đang tải...</p>
            ) : roadmap.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Chưa có lộ trình nào.</p>
            ) : (
              roadmap.map((step, idx) => (
                <RoadmapCard
                  key={step._id || step.id || idx}
                  step={step}
                  isAdmin={isAdmin}
                  onEdit={() => handleEditRoadmap(step)}
                  onDelete={() => handleDeleteRoadmap(step._id || step.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function RoadmapCard({ step, isAdmin, onEdit, onDelete }) {
  const weekLabel =
    step.weekEnd && step.weekEnd !== step.weekStart
      ? `Tuần ${step.weekStart}–${step.weekEnd}`
      : `Tuần ${step.weekStart}`;

  return (
    <div className="tm-card">
      <div className="tm-week">{weekLabel}</div>
      <div className="tm-title">{step.title}</div>
      <div className="tm-content">{step.content}</div>
      {isAdmin && (
        <div className="admin-card-actions">
          <button className="btn btn-outline btn-xs" onClick={onEdit}>✏️ Sửa</button>
          <button className="btn btn-danger btn-xs" onClick={onDelete}>🗑️ Xóa</button>
        </div>
      )}
    </div>
  );
}

// Fallback data nếu API chưa có dữ liệu
const DEFAULT_BEGINNER_ROADMAP = [
  {
    id: 1, weekStart: 1, weekEnd: 4,
    title: "Làm Quen Với Kỹ Thuật",
    content: "Học hình thức đúng cho Squat, Bench Press và Deadlift. Tập với trọng lượng nhẹ, tập trung vào kỹ thuật. 3 buổi/tuần.",
  },
  {
    id: 2, weekStart: 5, weekEnd: 8,
    title: "Xây Dựng Nền Tảng Sức Mạnh",
    content: "Tăng dần trọng lượng 2.5-5kg/tuần. Bắt đầu theo dõi khối lượng tập luyện (volume). 4 buổi/tuần.",
  },
  {
    id: 3, weekStart: 9, weekEnd: 12,
    title: "Chuẩn Bị Thi Đấu",
    content: "Thực hành các lượt lift theo luật thi đấu. Thử cân nặng mục tiêu cho ngày thi. Tapering 2 tuần cuối.",
  },
];