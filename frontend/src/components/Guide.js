import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { videoAPI } from "../services/api";
import Pagination from "./Pagination";

// Lưu các video đã xem trong phiên hiện tại (biến bộ nhớ → tự reset khi load lại
// trang). Mỗi video chỉ tính 1 lượt cho tới khi người dùng tải lại cả trang.
const viewedVideos = new Set();

export default function Guide() {
  const { state, actions } = useApp();
  const { isAdmin } = state;

  const [videos, setVideos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTag, setActiveTag] = useState("Tất cả");
  const [allTags, setAllTags] = useState(["Tất cả"]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [videosPerPage, setVideosPerPage] = useState(window.innerWidth < 768 ? 3 : 6);

  useEffect(() => {
    const handleResize = () => {
      setVideosPerPage(window.innerWidth < 768 ? 3 : 6);
      setPage(1); // Reset page on resize to prevent empty pages
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const load = () => {
    setLoading(true);
    videoAPI
      .getAll()
      .then((res) => {
        const data = res.data || [];
        setVideos(data);
        buildTags(data);
        setFiltered(data);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const buildTags = (data) => {
    const tags = new Set();
    data.forEach((v) => (v.tags || []).forEach((t) => tags.add(t)));
    setAllTags(["Tất cả", ...Array.from(tags)]);
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setPage(1);
    setFiltered(tag === "Tất cả" ? videos : videos.filter((v) => (v.tags || []).includes(tag)));
  };

  const openVideo = async (video) => {
    actions.openModal("videoViewer", { video });
    // Chỉ tính 1 lượt/phiên — bỏ qua nếu đã xem (chống spam khi bấm liên tục).
    if (viewedVideos.has(video.id)) return;
    viewedVideos.add(video.id);
    try {
      await videoAPI.incrementView(video.id);
      const bump = (list) =>
        list.map((v) => (v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v));
      setVideos(bump);
      setFiltered(bump);
    } catch (_) {
      viewedVideos.delete(video.id); // lỗi mạng → cho phép thử lại lần sau
    }
  };

  const totalPages = Math.ceil(filtered.length / videosPerPage);
  const paginated = filtered.slice((page - 1) * videosPerPage, page * videosPerPage);

  return (
    <section id="huong-dan" className="tutorial-section">
      <div className="container">
        <div className="section-header-wrap">
          <div className="section-label-lg">Video Hướng Dẫn Kỹ Thuật</div>
          {isAdmin && (
            <button
              className="btn btn-primary btn-sm add-card-btn"
              onClick={() => actions.openModal("addVideo", { onSaved: load, existingTags: allTags.filter(t => t !== "Tất cả") })}
            >
              + Thêm Video
            </button>
          )}
        </div>

        {/* Tag Filter */}
        <div className="tag-filter reveal" id="tagFilter">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-btn${activeTag === tag ? " active" : ""}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="video-grid reveal" id="videoGrid">
          {loading ? (
            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Đang tải...</p>
          ) : paginated.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Chưa có video nào.</p>
          ) : (
            paginated.map((video) => (
              <VideoCard
                key={video._id || video.id}
                video={video}
                isAdmin={isAdmin}
                onEdit={() => actions.openModal("addVideo", { editItem: video, onSaved: load, existingTags: allTags.filter(t => t !== "Tất cả") })}
                onDelete={() => handleDeleteVideo(video.id, load)}
                onPin={() => handleTogglePin(video, load)}
                onOpen={() => openVideo(video)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={videosPerPage}
          onChange={(p) => {
            setPage(p);
            document.getElementById("huong-dan")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>
    </section>
  );
}

function VideoCard({ video, isAdmin, onEdit, onDelete, onPin, onOpen }) {
  const thumb = video.thumbnail || getYoutubeThumbnail(video.url) || "";

  return (
    <div className={`video-card${video.pinned ? " is-pinned" : ""}`} onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="vc-thumb">
        {thumb ? (
          <img src={thumb} alt={video.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="vc-thumb-placeholder" />
        )}
        <div className="vc-play-overlay"><span className="vc-play-btn">▶</span></div>
        {video.pinned && <span className="pin-badge">📌 Đã ghim</span>}
      </div>
      <div className="vc-info">
        <div className="vc-title">{video.name}</div>
        <div className="vc-meta">
          <span className="vc-views">👁️ {video.views || 0} lượt xem</span>
        </div>
        <div className="vc-tags">
          {(video.tags || []).map((t) => (
            <span key={t} className="tag-chip">{t}</span>
          ))}
        </div>
        {isAdmin && (
          <div className="admin-card-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className={`btn btn-xs ${video.pinned ? "btn-pin-active" : "btn-outline"}`}
              onClick={onPin}
              title={video.pinned ? "Bỏ ghim" : "Ghim lên đầu"}
            >
              📌 {video.pinned ? "Bỏ ghim" : "Ghim"}
            </button>
            <button className="btn btn-outline btn-xs" onClick={onEdit}>✏️ Sửa</button>
            <button className="btn btn-danger btn-xs" onClick={onDelete}>🗑️ Xóa</button>
          </div>
        )}
      </div>
    </div>
  );
}

async function handleDeleteVideo(id, reload) {
  if (!window.confirm("Xóa video này?")) return;
  await videoAPI.delete(id);
  reload();
}

async function handleTogglePin(video, reload) {
  await videoAPI.update(video.id, { pinned: !video.pinned });
  reload();
}

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}