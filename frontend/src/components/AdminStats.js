import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const ROWS_PER_PAGE = 8;

export default function AdminStats() {
  const { state, actions } = useApp();
  const { isAdmin, stats } = state;

  const [videoPage, setVideoPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);

  useEffect(() => {
    if (isAdmin) actions.loadStats();
  }, [isAdmin]);

  if (!isAdmin) return null;

  const videos = stats.videos || [];
  const newsList = stats.news || [];

  const videoPaged = videos.slice((videoPage - 1) * ROWS_PER_PAGE, videoPage * ROWS_PER_PAGE);
  const newsPaged = newsList.slice((newsPage - 1) * ROWS_PER_PAGE, newsPage * ROWS_PER_PAGE);

  const videoTotalPages = Math.ceil(videos.length / ROWS_PER_PAGE);
  const newsTotalPages = Math.ceil(newsList.length / ROWS_PER_PAGE);

  return (
    <section id="adminStatsSection" className="admin-stats-section">
      <div className="container">
        <div className="admin-stats-card reveal">
          <h2 className="admin-stats-title">📊 Thống Kê Tương Tác</h2>

          <div className="admin-stats-grid">
            <div className="admin-stat-item">
              <span className="admin-stat-label">Tổng Lượt Xem Video</span>
              <span className="admin-stat-number">{stats.totalVideoViews || 0}</span>
            </div>
            <div className="admin-stat-item">
              <span className="admin-stat-label">Tổng Lượt Đọc Tin Tức</span>
              <span className="admin-stat-number">{stats.totalNewsViews || 0}</span>
            </div>
          </div>

          {/* Video detail */}
          <div className="admin-stats-detail">
            <h3 className="admin-stats-subtitle">🎬 Chi Tiết Lượt Xem Video</h3>
            <div className="admin-stats-table-wrap">
              <table className="admin-stats-table">
                <thead>
                  <tr>
                    <th>Tên Video</th>
                    <th>Tags</th>
                    <th>Lượt Xem</th>
                  </tr>
                </thead>
                <tbody>
                  {videoPaged.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ color: "var(--text-muted)", textAlign: "center" }}>
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    videoPaged.map((v) => (
                      <tr key={v._id || v.id}>
                        <td>{v.name}</td>
                        <td>{(v.tags || []).join(", ")}</td>
                        <td style={{ fontWeight: 700 }}>{v.views || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {videoTotalPages > 1 && (
              <Pagination current={videoPage} total={videoTotalPages} onChange={setVideoPage} />
            )}
          </div>

          {/* News detail */}
          <div className="admin-stats-detail">
            <h3 className="admin-stats-subtitle">📰 Chi Tiết Lượt Đọc Tin Tức</h3>
            <div className="admin-stats-table-wrap">
              <table className="admin-stats-table">
                <thead>
                  <tr>
                    <th>Tiêu Đề</th>
                    <th>Danh Mục</th>
                    <th>Ngày</th>
                    <th>Lượt Xem</th>
                  </tr>
                </thead>
                <tbody>
                  {newsPaged.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: "var(--text-muted)", textAlign: "center" }}>
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    newsPaged.map((n) => (
                      <tr key={n._id || n.id}>
                        <td>{n.title}</td>
                        <td>{n.category}</td>
                        <td>
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleDateString("vi-VN")
                            : "—"}
                        </td>
                        <td style={{ fontWeight: 700 }}>{n.views || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {newsTotalPages > 1 && (
              <Pagination current={newsPage} total={newsTotalPages} onChange={setNewsPage} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pagination({ current, total, onChange }) {
  return (
    <div className="pagination" style={{ marginTop: 15, justifyContent: "flex-end", gap: 4, display: "flex" }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`page-btn${p === current ? " active" : ""}`}
          style={{ minWidth: 32, padding: "4px 8px" }}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}