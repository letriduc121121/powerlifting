import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { newsAPI } from "../services/api";
import Pagination from "./Pagination";

const CATEGORIES = ["Tất cả", "THÔNG BÁO", "KẾT QUẢ", "VĐV NỔI BẬT", "HƯỚNG DẪN", "SỰ KIỆN"];
const NEWS_PER_PAGE = 6;

export default function News() {
  const { state, actions } = useApp();
  const { isAdmin, images } = state;

  const [news, setNews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    newsAPI
      .getAll()
      .then((res) => {
        const data = res.data || [];
        setNews(data);
        setFiltered(data);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Filter whenever category or search changes
  useEffect(() => {
    let result = news;
    if (activeCategory !== "Tất cả") {
      result = result.filter((n) => n.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.desc?.toLowerCase().includes(q) ||
          n.fullContent?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(1);
  }, [activeCategory, searchQuery, news]);

  const totalPages = Math.ceil(filtered.length / NEWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * NEWS_PER_PAGE, page * NEWS_PER_PAGE);

  const openDetail = async (item) => {
    actions.openModal("newsDetail", { news: item });
    // increment view count
    try {
      await newsAPI.incrementView(item._id || item.id);
      setNews((prev) =>
        prev.map((n) =>
          (n._id || n.id) === (item._id || item.id)
            ? { ...n, views: (n.views || 0) + 1 }
            : n
        )
      );
    } catch (_) {}
  };

  return (
    <section id="tin-tuc" className="news-section">
      <div className="container">
        <div className="section-header-wrap">
          <div className="section-label-lg">Tin Tức &amp; Sự Kiện</div>
          {isAdmin && (
            <button
              className="btn btn-primary btn-sm add-card-btn"
              onClick={() => actions.openModal("addNews", { onSaved: load })}
            >
              + Thêm Tin
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="news-filters-wrap reveal">
          <div className="news-categories" id="newsCategories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-btn${activeCategory === cat ? " active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="news-search-box">
            <input
              type="search"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="news-grid reveal" id="newsGrid">
          {loading ? (
            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Đang tải...</p>
          ) : paginated.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Không có bài viết nào.</p>
          ) : (
            paginated.map((item) => (
              <NewsCard
                key={item._id || item.id}
                item={item}
                isAdmin={isAdmin}
                fallback={images.newsFallback}
                onClick={() => openDetail(item)}
                onEdit={(e) => {
                  e.stopPropagation();
                  actions.openModal("addNews", { editItem: item, onSaved: load });
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  handleDeleteNews(item._id || item.id, load);
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={NEWS_PER_PAGE}
          onChange={(p) => {
            setPage(p);
            document.getElementById("tin-tuc")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>
    </section>
  );
}

function NewsCard({ item, isAdmin, fallback, onClick, onEdit, onDelete }) {
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
    : "";

  return (
    <div
      className={`news-card${item.featured ? " news-card-featured" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="nc-img">
        {item.image || fallback ? (
          <img
            src={item.image || fallback}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="nc-img-placeholder" />
        )}
        <span className="nc-cat">{item.category || "THÔNG BÁO"}</span>
      </div>
      <div className="nc-body">
        <h4 className="nc-title">{item.title}</h4>
        <p className="nc-desc">{item.desc}</p>
        <div className="nc-meta">
          {dateStr && <span>📅 {dateStr}</span>}
          <span>👁️ {item.views || 0} lượt xem</span>
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

async function handleDeleteNews(id, reload) {
  if (!window.confirm("Xóa bài viết này?")) return;
  await newsAPI.delete(id);
  reload();
}