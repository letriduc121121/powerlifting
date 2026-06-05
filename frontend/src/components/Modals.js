import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { eventAPI, roadmapAPI, videoAPI, newsAPI, prizeAPI } from "../services/api";
import { resizeImage } from "../utils/resizeImage";

// Thêm class `.open` ngay sau khi mount để kích hoạt hiệu ứng fade/scale vào.
function useOpenTransition() {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(true), []);
  return open;
}

// ─── Reusable Modal Shell ──────────────────────────────────────────────────────
// Hiển thị overlay khi modal đang mở (state.modal === name). Click nền hoặc nút ✕ để đóng.
function ModalShell({ name, title, maxWidth = 500, children }) {
  const { actions } = useApp();
  const open = useOpenTransition();
  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={() => actions.closeModal()}>
      <div className="modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={() => actions.closeModal()}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}

// ─── 1. News Detail Popup ──────────────────────────────────────────────────────
export function NewsDetailModal() {
  const { state } = useApp();
  if (state.modal !== "newsDetail" || !state.modalData?.news) return null;
  return <NewsDetailView item={state.modalData.news} />;
}

function NewsDetailView({ item }) {
  const { actions } = useApp();
  const open = useOpenTransition();
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
    : "";

  return (
    <div
      className={`news-detail-overlay${open ? " open" : ""}`}
      id="newsDetailOverlay"
      onClick={(e) => {
        if (e.target.id === "newsDetailOverlay") actions.closeModal();
      }}
    >
      <div className="news-detail-popup" id="newsDetailPopup">
        <button className="ndp-close" onClick={() => actions.closeModal()}>✕</button>
        <div
          className="ndp-img"
          style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
        />
        <div className="ndp-body">
          <span className="ndp-cat">{item.category || "THÔNG BÁO"}</span>
          <h2>{item.title}</h2>
          <span className="ndp-date">
            📅 {dateStr} | 👁️ {item.views ?? 0} lượt xem
          </span>
          {item.desc && <div className="ndp-desc-quote">{item.desc}</div>}
          <div className="ndp-content">{item.fullContent || "Nội dung chi tiết..."}</div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Login Admin Modal ──────────────────────────────────────────────────────
export function LoginModal() {
  const { state } = useApp();
  if (state.modal !== "login") return null;
  return <LoginForm />;
}

function LoginForm() {
  const { actions } = useApp();
  const [error, setError] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await actions.login(e.target.username.value, e.target.password.value);
      actions.closeModal();
    } catch (_) {
      setError(true);
    }
  };

  return (
    <ModalShell name="login" title="Đăng Nhập Admin" maxWidth={360}>
      <form onSubmit={submit} autoComplete="on">
        <div className="modal-body">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input type="text" name="username" autoComplete="username" placeholder="Tên đăng nhập..." />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" name="password" autoComplete="current-password" placeholder="Mật khẩu..." />
          </div>
          {error && (
            <p style={{ color: "#ea4335", fontSize: "0.85rem", margin: "0 0 10px" }}>
              Tài khoản hoặc mật khẩu không chính xác!
            </p>
          )}
        </div>
        <ModalFooter>
          <button type="submit" className="btn btn-primary">Đăng Nhập</button>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}

// ─── 3. Edit Field Modal (hero / thông tin giải đấu) ───────────────────────────
export function EditFieldModal() {
  const { state } = useApp();
  if (state.modal !== "editField") return null;
  return <EditFieldForm data={state.modalData || {}} />;
}

function EditFieldForm({ data }) {
  const { actions } = useApp();
  const { key, title, value, isTextarea } = data;
  const [val, setVal] = useState(value || "");

  const save = async () => {
    await actions.updateConfig(key, val);
    actions.closeModal();
  };

  return (
    <ModalShell name="editField" title={title || "Chỉnh sửa"} maxWidth={400}>
      <div className="modal-body">
        <div className="form-group">
          <label>Giá trị mới</label>
          {isTextarea ? (
            <textarea rows={8} value={val} onChange={(e) => setVal(e.target.value)} />
          ) : (
            <input type="text" value={val} onChange={(e) => setVal(e.target.value)} />
          )}
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Lưu</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 4. Add/Edit Event Modal ───────────────────────────────────────────────────
export function AddEventModal() {
  const { state } = useApp();
  if (state.modal !== "addEvent") return null;
  return <AddEventForm data={state.modalData || {}} />;
}

function AddEventForm({ data }) {
  const { actions } = useApp();
  const { editItem, onSaved } = data;
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || "",
    icon: editItem?.icon || "",
    desc: editItem?.desc || "",
  });

  const save = async () => {
    if (isEdit) await eventAPI.update(editItem.id || editItem._id, form);
    else await eventAPI.create(form);
    onSaved?.();
    actions.closeModal();
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <ModalShell name="addEvent" title={isEdit ? "Chỉnh Sửa Nội Dung" : "Thêm Nội Dung Thi Đấu"}>
      <div className="modal-body">
        <div className="form-group">
          <label>Tên bài thi</label>
          <input type="text" value={form.name} placeholder="Ví dụ: SQUAT" onChange={set("name")} />
        </div>
        <div className="form-group">
          <label>Biểu tượng (emoji)</label>
          <input type="text" value={form.icon} placeholder="Ví dụ: 🦵" onChange={set("icon")} />
        </div>
        <div className="form-group">
          <label>Mô tả chi tiết</label>
          <textarea rows={3} value={form.desc} placeholder="Mô tả kỹ thuật bài thi..." onChange={set("desc")} />
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Lưu</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 5. Add/Edit Roadmap Modal ─────────────────────────────────────────────────
export function AddRoadmapModal() {
  const { state } = useApp();
  if (state.modal !== "addRoadmap") return null;
  return <AddRoadmapForm data={state.modalData || {}} />;
}

function AddRoadmapForm({ data }) {
  const { actions } = useApp();
  const { editItem, onSaved, type = "tournament", existing = [] } = data;
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    weekStart: editItem?.weekStart || "",
    weekEnd: editItem?.weekEnd || "",
    title: editItem?.title || "",
    content: editItem?.content || "",
    type: editItem?.type || type,
  });

  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors((err) => ({ ...err, [key]: "" }));
  };

  const save = async () => {
    if (!form.weekStart) {
      setErrors({ weekStart: "Vui lòng nhập tuần bắt đầu." });
      return;
    }
    const targetStart = Number(form.weekStart);
    const targetEnd = form.weekEnd ? Number(form.weekEnd) : targetStart;
    
    if (targetEnd < targetStart) {
      setErrors({ weekStart: "Tuần kết thúc không thể nhỏ hơn tuần bắt đầu." });
      return;
    }

    const isDuplicate = existing.some(s => {
      if (String(s.id || s._id) === String(editItem?.id || editItem?._id)) return false;
      const sStart = Number(s.weekStart);
      const sEnd = s.weekEnd ? Number(s.weekEnd) : sStart;
      return Math.max(targetStart, sStart) <= Math.min(targetEnd, sEnd);
    });

    if (isDuplicate) {
      setErrors({ weekStart: `Khoảng thời gian này bị trùng lặp với lộ trình đã có.` });
      return;
    }
    if (isEdit) await roadmapAPI.update(editItem.id || editItem._id, form);
    else await roadmapAPI.create(form);
    onSaved?.();
    actions.closeModal();
  };

  return (
    <ModalShell name="addRoadmap" title={isEdit ? "Chỉnh Sửa Lộ Trình" : "Thêm Lộ Trình"}>
      <div className="modal-body">
        <div className="form-group">
          <label>Khoảng thời gian (Tuần)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700 }}>Tuần</span>
            <input type="number" min={1} max={99} placeholder="Từ" value={form.weekStart}
              style={{ width: 80 }} onChange={set("weekStart")} />
            <span style={{ color: "var(--text-muted)" }}>đến</span>
            <input type="number" min={1} max={99} placeholder="Đến (Tùy chọn)" value={form.weekEnd}
              style={{ width: 100 }} onChange={set("weekEnd")} />
          </div>
          {errors.weekStart && <div style={{ color: "#ea4335", fontSize: "0.85rem", marginTop: 4 }}>{errors.weekStart}</div>}
        </div>
        <div className="form-group">
          <label>Tiêu đề bài học</label>
          <input type="text" value={form.title} placeholder="Ví dụ: Kỹ thuật căn bản" onChange={set("title")} />
        </div>
        <div className="form-group">
          <label>Nội dung lộ trình</label>
          <textarea rows={4} value={form.content} placeholder="Mô tả chi tiết giáo án tập luyện..." onChange={set("content")} />
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Lưu</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 6. Add/Edit Video Modal ───────────────────────────────────────────────────
export function AddVideoModal() {
  const { state } = useApp();
  if (state.modal !== "addVideo") return null;
  return <AddVideoForm data={state.modalData || {}} />;
}

function AddVideoForm({ data }) {
  const { actions } = useApp();
  const { editItem, onSaved, existingTags = [] } = data;
  const isEdit = !!editItem;

  const [form, setForm] = useState({
    name: editItem?.name || "",
    url: editItem?.url || "",
    thumbnail: editItem?.thumbnail || "",
    tags: [...(editItem?.tags || [])],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: "" }));
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (!form.tags.includes(tag)) setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (t) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const onThumb = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, { maxDim: 1280, format: "jpeg" });
      setForm((f) => ({ ...f, thumbnail: dataUrl }));
    } catch (err) {
      alert("Không xử lý được ảnh: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const save = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập tên video.";
    if (!form.url.trim()) newErrors.url = "Vui lòng nhập URL video.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit) await videoAPI.update(editItem.id || editItem._id, form);
    else await videoAPI.create(form);
    onSaved?.();
    actions.closeModal();
  };

  return (
    <ModalShell name="addVideo" title={isEdit ? "Chỉnh Sửa Video" : "Thêm Video Hướng Dẫn"}>
      <div className="modal-body">
        <div className="form-group">
          <label>Tên video</label>
          <input type="text" value={form.name} placeholder="Tên bài hướng dẫn..." onChange={set("name")} />
          {errors.name && <div style={{ color: "#ea4335", fontSize: "0.85rem", marginTop: 4 }}>{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>URL Video (YouTube / Vimeo / Drive)</label>
          <input type="text" value={form.url} placeholder="https://www.youtube.com/watch?v=..." onChange={set("url")} />
          {errors.url && <div style={{ color: "#ea4335", fontSize: "0.85rem", marginTop: 4 }}>{errors.url}</div>}
        </div>
        <div className="form-group">
          <label>Ảnh thumbnail (tùy chọn)</label>
          <input type="file" accept="image/*" onChange={onThumb} />
          <p className="file-note">Để trống sẽ dùng ảnh YouTube mặc định.</p>
          {form.thumbnail && (
            <img src={form.thumbnail} alt="Thumbnail" className="news-img-preview" style={{ display: "block" }} />
          )}
        </div>
        <div className="form-group">
          <label>Tags danh mục (Gõ rồi nhấn Enter)</label>
          <div className="tags-input-wrap">
            {form.tags.map((t) => (
              <span key={t} style={{
                display: "inline-flex", alignItems: "center", gap: 4, background: "var(--blue)",
                color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: "0.82rem", margin: 2,
              }}>
                {t}
                <span style={{ cursor: "pointer" }} onClick={() => removeTag(t)}>✕</span>
              </span>
            ))}
            <input type="text" value={tagInput} placeholder="Thêm tag..."
              onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
          </div>
          {existingTags.filter(t => !form.tags.includes(t)).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginRight: 8 }}>Gợi ý:</span>
              {existingTags.filter(t => !form.tags.includes(t)).map(t => (
                <span key={t} onClick={() => setForm(f => ({ ...f, tags: [...f.tags, t] }))} style={{
                  display: "inline-block", background: "var(--bg-light)", color: "var(--text)", border: "1px solid var(--border)",
                  borderRadius: 4, padding: "2px 8px", fontSize: "0.82rem", margin: 2, cursor: "pointer"
                }}>
                  + {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Lưu Video</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 7. Add/Edit News Modal ────────────────────────────────────────────────────
export function AddNewsModal() {
  const { state } = useApp();
  if (state.modal !== "addNews") return null;
  return <AddNewsForm data={state.modalData || {}} />;
}

function AddNewsForm({ data }) {
  const { actions } = useApp();
  const { editItem, onSaved } = data;
  const isEdit = !!editItem;

  const [form, setForm] = useState({
    title: editItem?.title || "",
    category: editItem?.category || "THÔNG BÁO",
    desc: editItem?.desc || "",
    fullContent: editItem?.fullContent || "",
    image: editItem?.image || "",
    featured: editItem?.featured || 0,
  });

  const [errors, setErrors] = useState({});

  const set = (key, transform = (v) => v) => (e) => {
    setForm((f) => ({ ...f, [key]: transform(e.target.value) }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: "" }));
  };

  const onImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, { maxDim: 1600, format: "jpeg" });
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      alert("Không xử lý được ảnh: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const save = async () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề bài viết.";
    if (!form.desc.trim()) newErrors.desc = "Vui lòng nhập tóm tắt ngắn.";
    if (!form.fullContent.trim()) newErrors.fullContent = "Vui lòng nhập nội dung chi tiết.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit) await newsAPI.update(editItem.id || editItem._id, form);
    else await newsAPI.create(form);
    onSaved?.();
    actions.closeModal();
  };

  return (
    <ModalShell name="addNews" title={isEdit ? "Chỉnh Sửa Tin Tức" : "Thêm Tin Tức Mới"}>
      <div className="modal-body">
        <div className="form-group">
          <label>Tiêu đề bài viết</label>
          <input type="text" value={form.title} placeholder="Tiêu đề..." onChange={set("title")} />
          {errors.title && <div style={{ color: "#ea4335", fontSize: "0.85rem", marginTop: 4 }}>{errors.title}</div>}
        </div>
        <div className="form-group">
          <label>Danh mục</label>
          <select value={form.category} onChange={set("category")}>
            {["THÔNG BÁO", "KẾT QUẢ", "VĐV NỔI BẬT", "HƯỚNG DẪN", "SỰ KIỆN"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tóm tắt ngắn (1-2 câu)</label>
          <textarea rows={2} value={form.desc} placeholder="Hiển thị ở trang danh sách..." onChange={set("desc")} />
          {errors.desc && <div style={{ color: "#ea4335", fontSize: "0.85rem", marginTop: 4 }}>{errors.desc}</div>}
        </div>
        <div className="form-group">
          <label>Nội dung chi tiết</label>
          <textarea rows={6} value={form.fullContent} placeholder="Viết nội dung bài viết đầy đủ..." onChange={set("fullContent")} />
          {errors.fullContent && <div style={{ color: "#ea4335", fontSize: "0.85rem", marginTop: 4 }}>{errors.fullContent}</div>}
        </div>
        <div className="form-group">
          <label>Hình ảnh bài viết</label>
          <input type="file" accept="image/*" onChange={onImage} />
          {form.image && (
            <img src={form.image} alt="Preview" className="news-img-preview" style={{ display: "block" }} />
          )}
        </div>
        <div className="form-group">
          <label>Độ rộng hiển thị (Tin nổi bật)?</label>
          <select value={form.featured} onChange={set("featured", Number)}>
            <option value={0}>Tin thường (1 cột)</option>
            <option value={1}>Tin nổi bật (Chiếm 2 cột)</option>
          </select>
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Đăng Tin</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 8. Edit Prizes Modal ──────────────────────────────────────────────────────
const PRIZE_TIERS = [
  { key: "gold", emoji: "🥇", label: "Giải Vàng (Vô Địch)" },
  { key: "silver", emoji: "🥈", label: "Giải Bạc (Á Quân)" },
  { key: "bronze", emoji: "🥉", label: "Giải Đồng (Hạng Ba)" },
];

export function PrizesModal() {
  const { state } = useApp();
  if (state.modal !== "prizes") return null;
  return <PrizesForm data={state.modalData || {}} />;
}

function PrizesForm({ data }) {
  const { actions } = useApp();
  const { prizes, onSaved } = data;
  const [form, setForm] = useState({
    gold: { ...prizes?.gold },
    silver: { ...prizes?.silver },
    bronze: { ...prizes?.bronze },
  });

  const set = (tier, field) => (e) =>
    setForm((f) => ({ ...f, [tier]: { ...f[tier], [field]: e.target.value } }));

  const save = async () => {
    await prizeAPI.update(form);
    onSaved?.(form);
    actions.closeModal();
  };

  return (
    <ModalShell name="prizes" title="Chỉnh Sửa Giải Thưởng" maxWidth={450}>
      <div className="modal-body">
        {PRIZE_TIERS.map(({ key, emoji, label }) => (
          <div key={key}>
            <h4 className="modal-sub-title">{emoji} {label}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Số tiền</label>
                <input type="text" value={form[key].amount || ""} onChange={set(key, "amount")} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Mô tả phụ</label>
                <input type="text" value={form[key].desc || ""} onChange={set(key, "desc")} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Lưu Giải Thưởng</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 9. Edit Registration Link Modal ──────────────────────────────────────────
export function RegLinkModal() {
  const { state } = useApp();
  if (state.modal !== "regLink") return null;
  return <RegLinkForm data={state.modalData || {}} />;
}

function RegLinkForm({ data }) {
  const { actions } = useApp();
  const [val, setVal] = useState(data.value || "");

  const save = async () => {
    await actions.updateConfig("regLink", val);
    actions.closeModal();
  };

  return (
    <ModalShell name="regLink" title="Link Đăng Ký Giải Đấu" maxWidth={440}>
      <div className="modal-body">
        <div className="form-group">
          <label>Đường dẫn Form đăng ký (Google Form, etc.)</label>
          <input type="text" value={val} placeholder="https://docs.google.com/forms/..."
            onChange={(e) => setVal(e.target.value)} />
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => actions.closeModal()}>Hủy</button>
        <button className="btn btn-primary" onClick={save}>Lưu</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 10. Video Viewer Modal ────────────────────────────────────────────────────
function toEmbedUrl(url) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export function VideoViewerModal() {
  const { state } = useApp();
  if (state.modal !== "videoViewer" || !state.modalData?.video) return null;
  return <VideoViewerView video={state.modalData.video} />;
}

function VideoViewerView({ video }) {
  const { actions } = useApp();
  const open = useOpenTransition();

  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={() => actions.closeModal()}>
      <div className="modal video-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close video-viewer-close" onClick={() => actions.closeModal()}>✕</button>
        <div className="video-viewer-container">
          <iframe
            src={toEmbedUrl(video.url)}
            title={video.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", aspectRatio: "16/9", border: "none", borderRadius: 8 }}
          />
        </div>
        <div className="video-viewer-info"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 12px 0" }}>{video.name}</h3>
            <div>
              {(video.tags || []).map((t) => (
                <span key={t} style={{
                  display: "inline-block", background: "var(--blue)", color: "#fff",
                  borderRadius: 4, padding: "2px 8px", fontSize: "0.8rem", marginRight: 4,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="video-viewer-views" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>👁️</span>
            <span>{video.views ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 11. Image Config Modal ────────────────────────────────────────────────────
const IMAGE_SECTIONS = [
  { key: "logo", title: "1. LOGO WEBSITE" },
  { key: "heroBg", title: "2. ẢNH NỀN HERO" },
  { key: "chatbotLogo", title: "3. LOGO CHAT BOX (MASCOT)" },
  { key: "newsFallback", title: "4. ẢNH BÀI VIẾT MẶC ĐỊNH (NEWS FALLBACK)" },
];

export function ImageConfigModal() {
  const { state, actions } = useApp();
  if (state.modal !== "imageConfig") return null;

  const previews = state.images || {};

  const setImage = (key, value) => actions.updateImages(key, value);
  const onFile = (key) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // Nén ảnh trước khi lưu để không vượt giới hạn 16MB của MongoDB.
      // Logo & mascot cần nền trong suốt → PNG; ảnh nền/fallback → JPEG cho nhẹ.
      const transparent = key === "logo" || key === "chatbotLogo";
      const dataUrl = await resizeImage(file, {
        maxDim: key === "heroBg" ? 1920 : 1280,
        format: transparent ? "png" : "jpeg",
      });
      setImage(key, dataUrl);
    } catch (err) {
      alert("Không xử lý được ảnh: " + err.message);
    } finally {
      e.target.value = ""; // cho phép chọn lại cùng tệp
    }
  };

  return (
    <ModalShell name="imageConfig" title="QUẢN LÝ HÌNH ẢNH HỆ THỐNG" maxWidth={600}>
      <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        {IMAGE_SECTIONS.map(({ key, title }) => (
          <div key={key} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 20, marginBottom: 20 }}>
            <h4 style={{ color: "var(--blue)", marginBottom: 12 }}>{title}</h4>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Đường dẫn URL ảnh</label>
              <input type="text" placeholder="URL ảnh..." value={previews[key] || ""}
                onChange={(e) => setImage(key, e.target.value)} />
            </div>
            <div className="form-group media-uploader">
              <label>Hoặc tải ảnh lên từ thiết bị</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="file" accept="image/*" onChange={onFile(key)} />
                {previews[key] && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setImage(key, "")}>
                    Xóa
                  </button>
                )}
              </div>
              {previews[key] && (
                <img src={previews[key]} alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 6, objectFit: "contain", marginTop: 8 }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <ModalFooter>
        <button className="btn btn-primary" onClick={() => actions.closeModal()}>Hoàn tất</button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── Root Modals Bundle ────────────────────────────────────────────────────────
export default function Modals() {
  return (
    <>
      <NewsDetailModal />
      <LoginModal />
      <EditFieldModal />
      <AddEventModal />
      <AddRoadmapModal />
      <AddVideoModal />
      <AddNewsModal />
      <PrizesModal />
      <RegLinkModal />
      <VideoViewerModal />
      <ImageConfigModal />
    </>
  );
}
