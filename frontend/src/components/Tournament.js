import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Scale, Users } from "lucide-react";
import { useApp } from "../context/AppContext";
import { eventAPI, roadmapAPI, prizeAPI } from "../services/api";

const DEFAULT_PRIZES = {
  gold: { amount: "5.000.000đ", desc: "Huy chương Vàng + Cúp" },
  silver: { amount: "3.000.000đ", desc: "Huy chương Bạc" },
  bronze: { amount: "1.500.000đ", desc: "Huy chương Đồng" },
};

const DEFAULT_EVENTS = [
  { id: 1, icon: "🦵", name: "SQUAT", desc: "Gánh tạ xuống đến khi đùi song song mặt đất, đứng lên hoàn toàn." },
  { id: 2, icon: "💪", name: "BENCH PRESS", desc: "Nằm ngửa đẩy tạ từ ngực lên đến khi tay duỗi thẳng hoàn toàn." },
  { id: 3, icon: "🏋️", name: "DEADLIFT", desc: "Kéo tạ từ sàn lên đến khi đứng thẳng, vai sau, hông khóa." },
];

export default function Tournament() {
  const { state, actions } = useApp();
  const { isAdmin, config } = state;

  const [events, setEvents] = useState([]);
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);
  const [roadmap, setRoadmap] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const reloadEvents = () => {
    eventAPI.getAll()
      .then((res) => setEvents(res.data || []))
      .catch(() => setEvents(DEFAULT_EVENTS))
      .finally(() => setLoadingEvents(false));
  };

  const reloadRoadmap = () => {
    roadmapAPI.getAll("tournament")
      .then((res) => setRoadmap(res.data || []))
      .catch(() => setRoadmap([]));
  };

  useEffect(() => {
    reloadEvents();
    reloadRoadmap();
    prizeAPI.getAll()
      .then((res) => { if (res.data) setPrizes(res.data); })
      .catch(() => {});
  }, []);

  const openEdit = (key, title, isTextarea = false) => {
    if (!isAdmin) return;
    actions.openModal("editField", { key, title, value: config[key], isTextarea });
  };

  const EditableField = ({ configKey, title, tag: Tag = "span", style, isTextarea }) => (
    <span className="field-wrap" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Tag className="editable-field" style={style}>{config[configKey]}</Tag>
      {isAdmin && (
        <button className="field-edit-icon" onClick={() => openEdit(configKey, title, isTextarea)}>✏️</button>
      )}
    </span>
  );

  return (
    <section id="giai-dau" className="tournament-section">
      <div className="container">
        <div className="centered-header">
          <div className="section-label-lg">Thông Tin Giải Đấu</div>
        </div>

        {/* Info Cards */}
        <div className="info-grid reveal">
          <div className="info-card">
            <div className="ic-icon"><Calendar className="w-8 h-8" style={{ color: "var(--blue)" }} /></div>
            <h3>Thời Gian</h3>
            <p><EditableField configKey="heroDate" title="Chỉnh sửa Ngày Giải Đấu" /></p>
            <small><EditableField configKey="infoTimeSub" title="Chỉnh sửa Giờ thi đấu" /></small>
          </div>

          <div className="info-card">
            <div className="ic-icon"><MapPin className="w-8 h-8" style={{ color: "var(--blue)" }} /></div>
            <h3>Địa Điểm</h3>
            <p><EditableField configKey="heroLocation" title="Chỉnh sửa Địa điểm" /></p>
            <small><EditableField configKey="infoLocationSub" title="Chỉnh sửa Tên nhà thi đấu" /></small>
          </div>

          <div className="info-card">
            <div className="ic-icon"><Scale className="w-8 h-8" style={{ color: "var(--blue)" }} /></div>
            <h3>Hạng Cân</h3>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.5 }}>
              <EditableField configKey="infoWeightClass" title="Chỉnh sửa Hạng cân Nam" />
            </p>
            <small style={{ fontSize: "0.85rem", lineHeight: 1.5, marginTop: 6, display: "block" }}>
              <EditableField configKey="infoWeightClassSub" title="Chỉnh sửa Hạng cân Nữ" />
            </small>
          </div>

          <div className="info-card">
            <div className="ic-icon"><Users className="w-8 h-8" style={{ color: "var(--blue)" }} /></div>
            <h3>Đối Tượng</h3>
            <p><EditableField configKey="infoTarget" title="Chỉnh sửa Đối tượng tham gia" /></p>
            <small><EditableField configKey="infoTargetSub" title="Chỉnh sửa Độ tuổi quy định" /></small>
          </div>
        </div>

        {/* Events */}
        <div className="sub-heading">Các Nội Dung Thi Đấu</div>
        <div className="events-row reveal" id="eventsRow">
          {loadingEvents ? (
            <p style={{ color: "var(--text-muted)" }}>Đang tải...</p>
          ) : (
            events.map((ev) => (
              <EventCard
                key={ev._id || ev.id}
                event={ev}
                isAdmin={isAdmin}
                onEdit={() => actions.openModal("addEvent", { editItem: ev, onSaved: reloadEvents })}
                onDelete={() => handleDeleteEvent(ev._id || ev.id, reloadEvents)}
              />
            ))
          )}
        </div>
        {isAdmin && (
          <div className="admin-add-wrap">
            <button
              className="btn btn-outline btn-sm add-card-btn"
              onClick={() => actions.openModal("addEvent", { onSaved: reloadEvents })}
            >
              + Thêm Nội Dung
            </button>
          </div>
        )}

        {/* Prizes */}
        <div className="sub-heading">
          Cơ Cấu Giải Thưởng
          {isAdmin && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginLeft: 12 }}
              onClick={() => actions.openModal("prizes", { prizes, onSaved: (p) => setPrizes(p) })}
            >
              ✏️ Sửa Giải Thưởng
            </button>
          )}
        </div>
        <div className="prizes-row reveal" id="prizesRow">
          <PrizeCard tier="gold" emoji="🥇" label="Vô Địch" prize={prizes.gold} />
          <PrizeCard tier="silver" emoji="🥈" label="Á Quân" prize={prizes.silver} />
          <PrizeCard tier="bronze" emoji="🥉" label="Hạng Ba" prize={prizes.bronze} />
        </div>

        {/* Tournament Roadmap */}
        <div className="sub-heading">Lộ Trình Chuẩn Bị Thi Đấu</div>
        <div className="tm-roadmap reveal" id="tmRoadmap">
          {roadmap.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "10px 0" }}>Chưa có lộ trình.</p>
          ) : (
            roadmap.map((step, idx) => (
              <RoadmapCard
                key={step._id || step.id || idx}
                step={step}
                isAdmin={isAdmin}
                onEdit={() => actions.openModal("addRoadmap", { type: "tournament", editItem: step, onSaved: reloadRoadmap })}
                onDelete={() => handleDeleteRoadmap(step._id || step.id, reloadRoadmap)}
              />
            ))
          )}
        </div>
        {isAdmin && (
          <div className="admin-add-wrap">
            <button
              className="btn btn-outline btn-sm add-card-btn"
              onClick={() => actions.openModal("addRoadmap", { type: "tournament", onSaved: reloadRoadmap })}
            >
              + Thêm Tuần
            </button>
          </div>
        )}

        {/* Register CTA */}
        <div id="dang-ky-link" className="register-cta reveal">
          <div className="register-cta-text">
            <h3>Sẵn Sàng Tranh Tài?</h3>
            <p>Đăng ký chính thức ngay hôm nay để có cơ hội thử thách giới hạn bản thân!</p>
            {isAdmin && (
              <div className="reg-link-admin">
                <button
                  className="btn btn-outline-white btn-sm"
                  onClick={() => actions.openModal("regLink", { value: config.regLink })}
                >
                  ✏️ Sửa Link Đăng Ký
                </button>
              </div>
            )}
          </div>
          <a
            href={config.regLink || "#"}
            className="btn btn-yellow"
            target="_blank"
            rel="noopener noreferrer"
          >
            Đăng Ký Ngay →
          </a>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event, isAdmin, onEdit, onDelete }) {
  return (
    <div className="event-card">
      <div className="ev-icon">{event.icon}</div>
      <h4 className="ev-name">{event.name}</h4>
      <p className="ev-desc">{event.desc}</p>
      {isAdmin && (
        <div className="admin-card-actions">
          <button className="btn btn-outline btn-xs" onClick={onEdit}>✏️ Sửa</button>
          <button className="btn btn-danger btn-xs" onClick={onDelete}>🗑️ Xóa</button>
        </div>
      )}
    </div>
  );
}

function PrizeCard({ tier, emoji, label, prize }) {
  return (
    <div className={`prize-card prize-${tier}`}>
      <div className="prize-emoji">{emoji}</div>
      <div className="prize-label">{label}</div>
      <div className="prize-amount">{prize?.amount || "—"}</div>
      <div className="prize-desc">{prize?.desc || ""}</div>
    </div>
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

async function handleDeleteEvent(id, reload) {
  if (!window.confirm("Xóa nội dung thi đấu này?")) return;
  await eventAPI.delete(id);
  reload();
}

async function handleDeleteRoadmap(id, reload) {
  if (!window.confirm("Xóa bước này?")) return;
  await roadmapAPI.delete(id);
  reload();
}