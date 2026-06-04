import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { videoAPI } from "../services/api";
import Pagination from "./Pagination";

const VIDEOS_PER_PAGE = 6;

export default function Guide() {
  const { state, actions } = useApp();
  const { isAdmin, images } = state;

  const [videos, setVideos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTag, setActiveTag] = useState("Tất cả");
  const [allTags, setAllTags] = useState(["Tất cả"]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

  const totalPages = Math.ceil(filtered.length / VIDEOS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * VIDEOS_PER_PAGE, page * VIDEOS_PER_PAGE);

  return (
    <section id="huong-dan" className="tutorial-section">
      <div className="container">
        <div className="section-header-wrap">
          <div className="section-label-lg">Video Hướng Dẫn Kỹ Thuật</div>
          {isAdmin && (
            <button
              className="btn btn-primary btn-sm add-card-btn"
              onClick={() => actions.openModal("addVideo", { onSaved: load })}
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
                fallback={images.videoFallback}
                onEdit={() => actions.openModal("addVideo", { editItem: video, onSaved: load })}
                onDelete={() => handleDeleteVideo(video._id || video.id, load)}
                onOpen={() => actions.openModal("videoViewer", { video })}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={VIDEOS_PER_PAGE}
          onChange={(p) => {
            setPage(p);
            document.getElementById("huong-dan")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>
    </section>
  );
}

function VideoCard({ video, isAdmin, fallback, onEdit, onDelete, onOpen }) {
  const thumb = video.thumbnail || getYoutubeThumbnail(video.url) || fallback || "";

  return (
    <div className="video-card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="vc-thumb">
        {thumb ? (
          <img src={thumb} alt={video.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="vc-thumb-placeholder" />
        )}
        <div className="vc-play-overlay">▶</div>
        <div className="vc-view-count">👁️ {video.views || 0}</div>
      </div>
      <div className="vc-info">
        <div className="vc-title">{video.name}</div>
        <div className="vc-tags">
          {(video.tags || []).map((t) => (
            <span key={t} className="tag-chip">{t}</span>
          ))}
        </div>
        {isAdmin && (
          <div className="admin-card-actions" onClick={(e) => e.stopPropagation()}>
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

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}