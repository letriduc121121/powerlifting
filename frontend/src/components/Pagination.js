import React from "react";

const DOTS = "…";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Phân trang dùng chung cho Video & Tin tức.
 * Hiển thị ‹ Trước · 1 … (current-1) (current) (current+1) … last · Sau ›
 * Rút gọn bằng dấu … khi có nhiều trang để tránh vỡ layout.
 *
 * Props:
 *   page        — trang hiện tại (1-based)
 *   totalPages  — tổng số trang
 *   onChange    — callback(p) khi đổi trang
 *   totalItems  — (tuỳ chọn) tổng số bản ghi → hiển thị dòng "Hiển thị X–Y / Z"
 *   pageSize    — (tuỳ chọn) số bản ghi mỗi trang, dùng kèm totalItems
 */
export default function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const delta = 1; // số trang hiển thị quanh trang hiện tại
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  const pages = [1];
  if (left > 2) pages.push(DOTS);
  pages.push(...range(left, right));
  if (right < totalPages - 1) pages.push(DOTS);
  pages.push(totalPages);

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  // Dòng tóm tắt phạm vi kết quả (chỉ khi có đủ thông tin)
  let summary = null;
  if (Number.isFinite(totalItems) && Number.isFinite(pageSize) && totalItems > 0) {
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);
    summary = (
      <p className="pagination-info">
        Hiển thị <strong>{from}–{to}</strong> trong tổng <strong>{totalItems}</strong>
      </p>
    );
  }

  return (
    <nav className="pagination-wrap" role="navigation" aria-label="Phân trang">
      {summary}

      <div className="pagination-controls">
        <button
          className="page-btn page-nav"
          disabled={page === 1}
          onClick={() => go(page - 1)}
          aria-label="Trang trước"
        >
          <span aria-hidden="true">‹</span>
          <span className="page-nav-text">Trước</span>
        </button>

        {pages.map((p, i) =>
          p === DOTS ? (
            <span key={`dots-${i}`} className="page-btn ellipsis" aria-hidden="true">
              {DOTS}
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === page ? " active" : ""}`}
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Trang ${p}`}
            >
              {p}
            </button>
          )
        )}

        <button
          className="page-btn page-nav"
          disabled={page === totalPages}
          onClick={() => go(page + 1)}
          aria-label="Trang sau"
        >
          <span className="page-nav-text">Sau</span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </nav>
  );
}
