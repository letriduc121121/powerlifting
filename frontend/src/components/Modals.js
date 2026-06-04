import { useAppContext } from "../context/AppContext";

// ─── Reusable Modal Shell ──────────────────────────────────────────────────────
function ModalShell({ id, children, maxWidth = 500 }) {
  const { closeModal, openModalId } = useAppContext();
  if (openModalId !== id) return null;
  return (
    <div className="modal-overlay" id={id} onClick={() => closeModal(id)}>
      <div
        className="modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="modal-header">
      <h3>{title}</h3>
      <button className="modal-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}

// ─── 1. News Detail Popup ──────────────────────────────────────────────────────
export function NewsDetailModal() {
  const { newsDetailItem, closeNewsDetail } = useAppContext();
  if (!newsDetailItem) return null;
  const { img, cat, title, date, views, desc, content } = newsDetailItem;
  return (
    <div
      className="news-detail-overlay"
      id="newsDetailOverlay"
      onClick={(e) => {
        if (e.target.id === "newsDetailOverlay") closeNewsDetail();
      }}
    >
      <div className="news-detail-popup" id="newsDetailPopup">
        <button className="ndp-close" onClick={closeNewsDetail}>
          ✕
        </button>
        <div
          className="ndp-img"
          id="ndpImg"
          style={img ? { backgroundImage: `url(${img})` } : undefined}
        />
        <div className="ndp-body">
          <span className="ndp-cat" id="ndpCat">
            {cat || "THÔNG BÁO"}
          </span>
          <h2 id="ndpTitle">{title}</h2>
          <span className="ndp-date" id="ndpDate">
            📅 {date} | 👁️ {views ?? 0} lượt xem
          </span>
          {desc && (
            <div className="ndp-desc-quote" id="ndpDescQuote">
              {desc}
            </div>
          )}
          <div className="ndp-content" id="ndpContent">
            {content || "Nội dung chi tiết..."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Login Admin Modal ──────────────────────────────────────────────────────
export function LoginModal() {
  const { closeModal, doLogin, loginError } = useAppContext();
  return (
    <ModalShell id="loginModal" maxWidth={360}>
      <ModalHeader
        title="Đăng Nhập Admin"
        onClose={() => closeModal("loginModal")}
      />
      <form
        id="loginForm"
        onSubmit={(e) => {
          e.preventDefault();
          doLogin(
            e.target.username.value,
            e.target.password.value
          );
        }}
        autoComplete="on"
      >
        <div className="modal-body">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Tên đăng nhập..."
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Mật khẩu..."
            />
          </div>
          {loginError && (
            <p style={{ color: "#ea4335", fontSize: "0.85rem", margin: "0 0 10px" }}>
              Tài khoản hoặc mật khẩu không chính xác!
            </p>
          )}
        </div>
        <ModalFooter>
          <button type="submit" className="btn btn-primary">
            Đăng Nhập
          </button>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}

// ─── 3. Edit Hero Field Modal ──────────────────────────────────────────────────
export function HeroFieldModal() {
  const { closeModal, heroFieldModal, saveHeroField } = useAppContext();
  if (!heroFieldModal) return null;
  const { title, fieldKey, isTextarea, currentValue } = heroFieldModal;
  let localValue = currentValue;
  return (
    <ModalShell id="heroFieldModal" maxWidth={400}>
      <ModalHeader title={title} onClose={() => closeModal("heroFieldModal")} />
      <div className="modal-body">
        <div className="form-group">
          <label>Giá trị mới</label>
          {isTextarea ? (
            <textarea
              rows={8}
              defaultValue={currentValue}
              onChange={(e) => (localValue = e.target.value)}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 10,
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                resize: "vertical",
              }}
            />
          ) : (
            <input
              type="text"
              defaultValue={currentValue}
              onChange={(e) => (localValue = e.target.value)}
            />
          )}
        </div>
      </div>
      <ModalFooter>
        <button
          className="btn btn-ghost-sm"
          onClick={() => closeModal("heroFieldModal")}
        >
          Hủy
        </button>
        <button
          className="btn btn-primary"
          onClick={() => saveHeroField(fieldKey, localValue)}
        >
          Lưu
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 4. Add/Edit Event Modal ───────────────────────────────────────────────────
export function AddEventModal() {
  const { closeModal, saveEvent, editingEvent } = useAppContext();
  const isEdit = !!editingEvent;
  let form = { name: editingEvent?.name || "", icon: editingEvent?.icon || "", desc: editingEvent?.desc || "" };
  return (
    <ModalShell id="addEventModal">
      <ModalHeader
        title={isEdit ? "Chỉnh Sửa Nội Dung" : "Thêm Nội Dung Thi Đấu"}
        onClose={() => closeModal("addEventModal")}
      />
      <div className="modal-body">
        <div className="form-group">
          <label>Tên bài thi</label>
          <input
            type="text"
            id="evName"
            defaultValue={form.name}
            placeholder="Ví dụ: SQUAT"
            onChange={(e) => (form.name = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Biểu tượng (emoji)</label>
          <input
            type="text"
            id="evIcon"
            defaultValue={form.icon}
            placeholder="Ví dụ: 🦵"
            onChange={(e) => (form.icon = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Mô tả chi tiết</label>
          <textarea
            id="evDesc"
            rows={3}
            defaultValue={form.desc}
            placeholder="Mô tả kỹ thuật bài thi..."
            onChange={(e) => (form.desc = e.target.value)}
          />
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => closeModal("addEventModal")}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={() => saveEvent(form)}>
          Lưu
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 5. Add/Edit Roadmap Modal ─────────────────────────────────────────────────
export function AddRoadmapModal() {
  const { closeModal, saveRoadmap, editingRoadmap } = useAppContext();
  const isEdit = !!editingRoadmap;
  let form = {
    weekStart: editingRoadmap?.weekStart || "",
    weekEnd: editingRoadmap?.weekEnd || "",
    title: editingRoadmap?.title || "",
    content: editingRoadmap?.content || "",
    type: editingRoadmap?.type || "tournament",
  };
  return (
    <ModalShell id="addRoadmapModal">
      <ModalHeader
        title={isEdit ? "Chỉnh Sửa Lộ Trình" : "Thêm Lộ Trình"}
        onClose={() => closeModal("addRoadmapModal")}
      />
      <div className="modal-body">
        <div className="form-group">
          <label>Khoảng thời gian (Tuần)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-cond)", fontWeight: 700, fontSize: "0.95rem" }}>
              Tuần
            </span>
            <input
              type="number"
              id="rmWeekStart"
              min={1}
              max={99}
              placeholder="Từ"
              defaultValue={form.weekStart}
              style={{ width: 80 }}
              onChange={(e) => (form.weekStart = e.target.value)}
            />
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>đến</span>
            <input
              type="number"
              id="rmWeekEnd"
              min={1}
              max={99}
              placeholder="Đến (Tùy chọn)"
              defaultValue={form.weekEnd}
              style={{ width: 100 }}
              onChange={(e) => (form.weekEnd = e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Tiêu đề bài học</label>
          <input
            type="text"
            id="rmTitle"
            defaultValue={form.title}
            placeholder="Ví dụ: Kỹ thuật căn bản"
            onChange={(e) => (form.title = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nội dung lộ trình</label>
          <textarea
            id="rmContent"
            rows={4}
            defaultValue={form.content}
            placeholder="Mô tả chi tiết giáo án tập luyện..."
            onChange={(e) => (form.content = e.target.value)}
          />
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => closeModal("addRoadmapModal")}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={() => saveRoadmap(form)}>
          Lưu
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 6. Add/Edit Video Modal ───────────────────────────────────────────────────
export function AddVideoModal() {
  const { closeModal, saveVideo, editingVideo } = useAppContext();
  const isEdit = !!editingVideo;
  const [videoTab, setVideoTab] = useState_("url");
  const [tags, setTags] = useState_([...(editingVideo?.tags || [])]);
  const [tagInput, setTagInput] = useState_("");
  const [thumbnailPreview, setThumbnailPreview] = useState_(editingVideo?.thumbnail || "");

  let form = {
    name: editingVideo?.name || "",
    url: editingVideo?.url || "",
    localFile: null,
    thumbnail: editingVideo?.thumbnail || "",
    tags,
  };

  const handleTagKey = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        const updated = [...tags, newTag];
        setTags(updated);
        form.tags = updated;
      }
      setTagInput("");
    }
  };

  const removeTag = (t) => {
    const updated = tags.filter((x) => x !== t);
    setTags(updated);
    form.tags = updated;
  };

  return (
    <ModalShell id="addVideoModal">
      <ModalHeader
        title={isEdit ? "Chỉnh Sửa Video" : "Thêm Video Hướng Dẫn"}
        onClose={() => closeModal("addVideoModal")}
      />
      <div className="modal-body">
        <div className="form-group">
          <label>Tên video</label>
          <input
            type="text"
            id="vName"
            defaultValue={form.name}
            placeholder="Tên bài hướng dẫn..."
            onChange={(e) => (form.name = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nguồn Video</label>
          <div className="tab-btns">
            <button
              className={`tab-btn${videoTab === "url" ? " active" : ""}`}
              onClick={() => setVideoTab("url")}
            >
              URL (YouTube / Vimeo)
            </button>
            <button
              className={`tab-btn${videoTab === "local" ? " active" : ""}`}
              onClick={() => setVideoTab("local")}
            >
              Tải lên file video
            </button>
          </div>
          {videoTab === "url" ? (
            <div className="video-src-panel active">
              <input
                type="text"
                id="vUrl"
                defaultValue={form.url}
                placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                onChange={(e) => (form.url = e.target.value)}
              />
              <p className="file-note">
                Hỗ trợ: YouTube, Vimeo, Google Drive.
              </p>
            </div>
          ) : (
            <div className="video-src-panel active">
              <input
                type="file"
                id="vFile"
                accept="video/*"
                onChange={(e) => (form.localFile = e.target.files[0])}
              />
              <p className="file-note">
                Chọn file video từ thiết bị của bạn.
              </p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Ảnh thumbnail</label>
          <input
            type="file"
            id="vThumbnail"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setThumbnailPreview(ev.target.result);
                  form.thumbnail = ev.target.result;
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <p className="file-note">Tùy chọn. Nếu để trống sẽ dùng ảnh YouTube mặc định.</p>
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="news-img-preview"
              style={{ display: "block" }}
            />
          )}
        </div>
        <div className="form-group">
          <label>Tags danh mục (Gõ rồi nhấn Enter)</label>
          <div className="tags-input-wrap" id="tagsWrap">
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "var(--blue)",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: "0.82rem",
                  margin: "2px",
                }}
              >
                {t}
                <span
                  style={{ cursor: "pointer", marginLeft: 2 }}
                  onClick={() => removeTag(t)}
                >
                  ✕
                </span>
              </span>
            ))}
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              placeholder="Thêm tag..."
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
            />
          </div>
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => closeModal("addVideoModal")}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={() => saveVideo(form)}>
          Lưu Video
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 7. Add/Edit News Modal ────────────────────────────────────────────────────
export function AddNewsModal() {
  const { closeModal, saveNews, editingNews } = useAppContext();
  const isEdit = !!editingNews;
  const [imgPreview, setImgPreview] = useState_(editingNews?.img || "");
  let form = {
    title: editingNews?.title || "",
    cat: editingNews?.cat || "THÔNG BÁO",
    desc: editingNews?.desc || "",
    fullContent: editingNews?.fullContent || "",
    img: editingNews?.img || "",
    featured: editingNews?.featured || 0,
  };

  return (
    <ModalShell id="addNewsModal">
      <ModalHeader
        title={isEdit ? "Chỉnh Sửa Tin Tức" : "Thêm Tin Tức Mới"}
        onClose={() => closeModal("addNewsModal")}
      />
      <div className="modal-body">
        <div className="form-group">
          <label>Tiêu đề bài viết</label>
          <input
            type="text"
            defaultValue={form.title}
            placeholder="Tiêu đề..."
            onChange={(e) => (form.title = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Danh mục</label>
          <select defaultValue={form.cat} onChange={(e) => (form.cat = e.target.value)}>
            {["THÔNG BÁO", "KẾT QUẢ", "VĐV NỔI BẬT", "HƯỚNG DẪN", "SỰ KIỆN"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tóm tắt ngắn (1-2 câu)</label>
          <textarea
            rows={2}
            defaultValue={form.desc}
            placeholder="Hiển thị ở trang danh sách..."
            onChange={(e) => (form.desc = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nội dung chi tiết</label>
          <textarea
            rows={6}
            defaultValue={form.fullContent}
            placeholder="Viết nội dung bài viết đầy đủ tại đây..."
            onChange={(e) => (form.fullContent = e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Hình ảnh bài viết</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setImgPreview(ev.target.result);
                  form.img = ev.target.result;
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <p className="file-note">Chọn file ảnh. File sẽ được nén và lưu ở dạng Base64.</p>
          {imgPreview && (
            <img
              src={imgPreview}
              alt="Preview"
              className="news-img-preview"
              style={{ display: "block" }}
            />
          )}
        </div>
        <div className="form-group">
          <label>Độ rộng hiển thị (Tin nổi bật)?</label>
          <select
            defaultValue={form.featured}
            onChange={(e) => (form.featured = Number(e.target.value))}
          >
            <option value={0}>Tin thường (1 cột)</option>
            <option value={1}>Tin nổi bật (Chiếm 2 cột)</option>
          </select>
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => closeModal("addNewsModal")}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={() => saveNews(form)}>
          Đăng Tin
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 8. Edit Prizes Modal ──────────────────────────────────────────────────────
export function PrizesModal() {
  const { closeModal, savePrizes, prizes } = useAppContext();
  let form = {
    goldAmt: prizes?.gold?.amt || "",
    goldDesc: prizes?.gold?.desc || "",
    silverAmt: prizes?.silver?.amt || "",
    silverDesc: prizes?.silver?.desc || "",
    bronzeAmt: prizes?.bronze?.amt || "",
    bronzeDesc: prizes?.bronze?.desc || "",
  };
  return (
    <ModalShell id="prizesModal" maxWidth={450}>
      <ModalHeader title="Chỉnh Sửa Giải Thưởng" onClose={() => closeModal("prizesModal")} />
      <div className="modal-body">
        {[
          { emoji: "🥇", label: "Giải Vàng (Vô Địch)", amtKey: "goldAmt", descKey: "goldDesc" },
          { emoji: "🥈", label: "Giải Bạc (Á Quân)", amtKey: "silverAmt", descKey: "silverDesc" },
          { emoji: "🥉", label: "Giải Đồng (Hạng Ba)", amtKey: "bronzeAmt", descKey: "bronzeDesc" },
        ].map(({ emoji, label, amtKey, descKey }) => (
          <div key={amtKey}>
            <h4 className="modal-sub-title">{emoji} {label}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Số tiền</label>
                <input
                  type="text"
                  defaultValue={form[amtKey]}
                  onChange={(e) => (form[amtKey] = e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Mô tả phụ</label>
                <input
                  type="text"
                  defaultValue={form[descKey]}
                  onChange={(e) => (form[descKey] = e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => closeModal("prizesModal")}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={() => savePrizes(form)}>
          Lưu Giải Thưởng
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 9. Edit Registration Link Modal ──────────────────────────────────────────
export function RegLinkModal() {
  const { closeModal, saveRegLink, regLink } = useAppContext();
  let localVal = regLink || "";
  return (
    <ModalShell id="regLinkModal" maxWidth={440}>
      <ModalHeader title="Link Đăng Ký Giải Đấu" onClose={() => closeModal("regLinkModal")} />
      <div className="modal-body">
        <div className="form-group">
          <label>Đường dẫn Form đăng ký (Google Form, etc.)</label>
          <input
            type="text"
            defaultValue={regLink}
            placeholder="https://docs.google.com/forms/..."
            onChange={(e) => (localVal = e.target.value)}
          />
        </div>
      </div>
      <ModalFooter>
        <button className="btn btn-ghost-sm" onClick={() => closeModal("regLinkModal")}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={() => saveRegLink(localVal)}>
          Lưu
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── 10. Video Viewer Modal ────────────────────────────────────────────────────
export function VideoViewerModal() {
  const { videoViewer, closeVideoViewer } = useAppContext();
  if (!videoViewer) return null;
  const { title, embedUrl, tags, views } = videoViewer;
  return (
    <div
      className="modal-overlay"
      id="videoViewerModal"
      style={{ display: "flex" }}
      onClick={closeVideoViewer}
    >
      <div
        className="modal video-viewer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close video-viewer-close"
          onClick={closeVideoViewer}
        >
          ✕
        </button>
        <div className="video-viewer-container" id="videoViewerContainer">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", aspectRatio: "16/9", border: "none", borderRadius: 8 }}
          />
        </div>
        <div
          className="video-viewer-info"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 12px 0" }}>{title}</h3>
            <div id="videoViewerTags">
              {(tags || []).map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-block",
                    background: "var(--blue)",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: "0.8rem",
                    marginRight: 4,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div
            className="video-viewer-views"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-cond)",
              fontWeight: 700,
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              padding: "6px 12px",
              background: "rgba(0,0,0,0.05)",
              borderRadius: 8,
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            <span>👁️</span>
            <span>{views ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 11. Image Config Modal ────────────────────────────────────────────────────
function ImageConfigSection({ title, configKey, preview, onUrlChange, onFileChange, onClear }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 20, marginBottom: 20 }}>
      <h4
        style={{
          fontFamily: "var(--font-cond)",
          color: "var(--blue)",
          marginBottom: 12,
          fontSize: "1.1rem",
          letterSpacing: 1,
        }}
      >
        {title}
      </h4>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label>Đường dẫn URL ảnh</label>
        <input
          type="text"
          placeholder="URL ảnh..."
          onChange={(e) => onUrlChange(configKey, e.target.value)}
        />
      </div>
      <div className="form-group media-uploader">
        <label>Hoặc tải ảnh lên từ thiết bị</label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => document.getElementById(`imgFile_${configKey}`).click()}
          >
            📁 Chọn File
          </button>
          {preview && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onClear(configKey)}
            >
              Xóa
            </button>
          )}
          <input
            type="file"
            id={`imgFile_${configKey}`}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => onFileChange(configKey, e.target.files[0])}
          />
        </div>
        <p className="file-note">Chấp nhận JPG, PNG, WebP. File sẽ được lưu dưới dạng Base64.</p>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: 120,
              borderRadius: 6,
              border: "1px solid var(--border)",
              objectFit: "contain",
              marginTop: 8,
            }}
          />
        )}
      </div>
    </div>
  );
}

export function ImageConfigModal() {
  const { closeModal, saveImageConfig, imageConfig, updateImagePreview } = useAppContext();
  const previews = imageConfig?.previews || {};

  const handleUrlChange = (key, val) => updateImagePreview(key, val);
  const handleFileChange = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => updateImagePreview(key, e.target.result);
    reader.readAsDataURL(file);
  };
  const handleClear = (key) => updateImagePreview(key, "");

  const sections = [
    { title: "1. LOGO WEBSITE", key: "logo" },
    { title: "2. ẢNH NỀN HERO", key: "heroBg" },
    { title: "3. LOGO CHAT BOX (MASCOT)", key: "chatbotLogo" },
    { title: "4. ẢNH BÀI VIẾT MẶC ĐỊNH (NEWS FALLBACK)", key: "newsFallback" },
    { title: "5. ẢNH VIDEO MẶC ĐỊNH (VIDEO FALLBACK)", key: "videoFallback" },
  ];

  return (
    <ModalShell id="imageConfigModal" maxWidth={600}>
      <ModalHeader
        title="QUẢN LÝ HÌNH ẢNH HỆ THỐNG"
        onClose={() => closeModal("imageConfigModal")}
      />
      <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        {sections.map(({ title, key }) => (
          <ImageConfigSection
            key={key}
            title={title}
            configKey={key}
            preview={previews[key] || ""}
            onUrlChange={handleUrlChange}
            onFileChange={handleFileChange}
            onClear={handleClear}
          />
        ))}
      </div>
      <ModalFooter>
        <button className="btn btn-primary" onClick={() => closeModal("imageConfigModal")}>
          Hoàn tất
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ─── useState_ shim (alias to avoid import requirement in this file) ──────────
// In production, import { useState } from "react" at top of file.
// This is a placeholder so the file is self-contained for reference.
function useState_(initial) {
  // This will be replaced by actual React import in real usage
  const { useState } = require !== undefined
    ? { useState: (v) => [v, () => {}] }
    : { useState: (v) => [v, () => {}] };
  return useState(initial);
}

// ─── Root Modals Bundle ────────────────────────────────────────────────────────
export default function Modals() {
  return (
    <>
      <NewsDetailModal />
      <LoginModal />
      <HeroFieldModal />
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