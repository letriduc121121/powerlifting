// js/tin-tuc.js — News section rendering, filter, pagination, details popup and CRUD

import { API_URL, getAuthHeaders, appNews, appData, loadData, NEWS_CATEGORIES, state } from './api.js';
import { openModal, closeModal, observeReveal, compressImage } from './utils.js';
import { checkAdminOrAlert } from './auth.js';

export function renderNewsCategories() {
  const container = document.getElementById('newsCategories');
  if (!container) return;
  container.innerHTML = NEWS_CATEGORIES.map(cat => `
    <button class="tag-btn ${cat === state.activeNewsCategory ? 'active' : ''}" onclick="filterNewsByCategory('${cat}')">
      ${cat}
    </button>
  `).join('');
}

export function filterNewsByCategory(cat) {
  state.activeNewsCategory = cat;
  state.currentNewsPage = 1;
  renderNewsCategories();
  renderNews();
}

export function renderNews() {
  const container = document.getElementById('newsGrid');
  if (!container) return;
  
  const filtered = appNews.filter(n => {
    const matchesCat = state.activeNewsCategory === 'TẤT CẢ' || n.cat === state.activeNewsCategory;
    const matchesSearch = 
      (n.title && n.title.toLowerCase().includes(state.newsSearchQuery.toLowerCase())) ||
      (n.desc && n.desc.toLowerCase().includes(state.newsSearchQuery.toLowerCase())) ||
      (n.fullContent && n.fullContent.toLowerCase().includes(state.newsSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 0; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px dashed var(--border);">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🔍</span>
        <p style="color: var(--text-muted);">Không tìm thấy tin tức nào khớp với tiêu chí tìm kiếm của bạn.</p>
      </div>
    `;
    const pagEl = document.getElementById('newsPagination');
    if (pagEl) pagEl.style.display = 'none';
    return;
  }

  const totalPages = Math.ceil(filtered.length / state.newsItemsPerPage);
  const activePage = Math.min(state.currentNewsPage, Math.max(1, totalPages));
  
  const startIndex = (activePage - 1) * state.newsItemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + state.newsItemsPerPage);

  container.innerHTML = paginatedItems.map(n => {
    const hasImg = n.image && n.image.length > 0;
    const fallbackUrl = (appData.images && appData.images.newsFallback) || '/images/news-fallback.png';
    const viewsCount = n.views || 0;
    
    return `
      <div class="news-card ${n.featured ? 'featured' : ''} reveal" onclick="openNewsDetail(${n.id})" style="cursor: pointer;">
        <div class="news-img-placeholder ${hasImg || fallbackUrl ? 'news-img-real' : ''}">
          ${hasImg ? `<img src="${n.image}" alt="${n.title}"/>` : fallbackUrl ? `<img src="${fallbackUrl}" alt="${n.title}"/>` : '<span style="font-size: 2.5rem; opacity: 0.3;">📰</span>'}
        </div>
        <div class="news-body">
          <div class="news-cat">${n.cat}</div>
          <h3>${n.title || ''}</h3>
          <p>${n.desc || ''}</p>
          <div class="news-bottom-row">
            <span class="news-date">${n.date || ''} <span style="margin-left: 12px; opacity: 0.75;">👁️ ${viewsCount}</span></span>
            <span class="news-readmore-link">Đọc thêm →</span>
          </div>
        </div>
        <div class="card-admin-btns" onclick="event.stopPropagation();">
          <button class="btn-ghost-sm" onclick="editNews(${n.id})">✏️ Sửa</button>
          <button class="btn-ghost-sm" style="color:#EA4335" onclick="deleteNews(${n.id})">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  renderNewsPagination(totalPages, activePage);
  observeReveal();
}

export function renderNewsPagination(totalPages, activePage) {
  const container = document.getElementById('newsPagination');
  if (!container) return;
  
  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  let buttons = `
    <button class="page-btn" ${activePage === 1 ? 'disabled' : ''} onclick="changeNewsPage(${activePage - 1})">
      Trước
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    buttons += `
      <button class="page-btn ${activePage === i ? 'active' : ''}" onclick="changeNewsPage(${i})">
        ${i}
      </button>
    `;
  }

  buttons += `
    <button class="page-btn" ${activePage === totalPages ? 'disabled' : ''} onclick="changeNewsPage(${activePage + 1})">
      Sau
    </button>
  `;

  container.innerHTML = buttons;
}

export function changeNewsPage(page) {
  state.currentNewsPage = page;
  renderNews();
  document.getElementById('tin-tuc').scrollIntoView({ behavior: 'smooth' });
}

// Bind newsSearchInput
export function bindNewsSearch() {
  const newsSearchInputEl = document.getElementById('newsSearchInput');
  if (newsSearchInputEl) {
    newsSearchInputEl.addEventListener('input', function(e) {
      state.newsSearchQuery = e.target.value;
      state.currentNewsPage = 1;
      renderNews();
    });
  }
}

// News details modal
export async function openNewsDetail(id) {
  const n = appNews.find(x => x.id === id);
  if (!n) return;

  if (!state.readNewsThisSession.has(id)) {
    state.readNewsThisSession.add(id);
    
    n.views = (n.views || 0) + 1;
    renderNews();
    
    import('./home.js').then(module => module.renderAdminStats());

    try {
      fetch(`${API_URL}/views/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'news', itemId: String(id) })
      });
    } catch (error) {
      console.error('Views sync failed:', error);
    }
  }

  const viewsCount = n.views || 0;
  const hasImg = n.image && n.image.length > 0;
  const fallbackUrl = (appData.images && appData.images.newsFallback) || '/images/news-fallback.png';
  
  document.getElementById('ndpImg').innerHTML = hasImg 
    ? `<img src="${n.image}" alt="${n.title}"/>` 
    : fallbackUrl ? `<img src="${fallbackUrl}" alt="${n.title}"/>`
    : '<span class="ndp-placeholder">📰</span>';
    
  document.getElementById('ndpCat').textContent = n.cat || '';
  document.getElementById('ndpTitle').textContent = n.title || '';
  document.getElementById('ndpDate').textContent = `📅 Ngày đăng: ${n.date || ''} | 👁️ ${viewsCount} lượt xem`;
  document.getElementById('ndpDescQuote').textContent = n.desc || '';
  document.getElementById('ndpContent').textContent = n.fullContent || 'Nội dung chi tiết đang được cập nhật...';

  const overlay = document.getElementById('newsDetailOverlay');
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });
  });
  document.body.style.overflow = 'hidden';
}

export function closeNewsDetail(e, force = false) {
  if (!force && e && e.target !== document.getElementById('newsDetailOverlay')) return;
  const overlay = document.getElementById('newsDetailOverlay');
  overlay.classList.remove('open');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 350);
  document.body.style.overflow = '';
}

// News CRUD admin functions
export async function previewNewsImage(input) {
  const file = input.files[0];
  if (!file) return;

  try {
    const base64 = await compressImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.75, forceJpeg: true });
    state.pendingNewsImage = base64;
    const preview = document.getElementById('nImagePreview');
    if (preview) {
      preview.src = base64;
      preview.style.display = 'block';
    }
  } catch (error) {
    console.error('Lỗi nén ảnh tin tức:', error);
    alert('Không thể tải ảnh: ' + error.message);
  }
}

export function openAddNewsModal() {
  if (!checkAdminOrAlert()) return;
  state.currentEditId = null;
  state.pendingNewsImage = '';
  
  document.getElementById('addNewsTitle').textContent = 'Viết Tin Tức Mới';
  document.getElementById('nTitle').value = '';
  document.getElementById('nDesc').value = '';
  document.getElementById('nFullContent').value = '';
  document.getElementById('nCat').value = 'THÔNG BÁO';
  document.getElementById('nFeatured').value = '0';
  document.getElementById('nImage').value = '';
  
  const preview = document.getElementById('nImagePreview');
  preview.style.display = 'none';
  preview.src = '';
  openModal('addNewsModal');
}

export function editNews(id) {
  if (!checkAdminOrAlert()) return;
  state.currentEditId = id;
  const n = appNews.find(x => x.id === id);
  if (!n) return;

  document.getElementById('addNewsTitle').textContent = 'Chỉnh Sửa Tin Tức';
  document.getElementById('nTitle').value = n.title;
  document.getElementById('nDesc').value = n.desc;
  document.getElementById('nFullContent').value = n.fullContent || '';
  document.getElementById('nCat').value = n.cat;
  document.getElementById('nFeatured').value = n.featured ? '1' : '0';
  document.getElementById('nImage').value = '';

  const preview = document.getElementById('nImagePreview');
  if (n.image) {
    preview.src = n.image;
    preview.style.display = 'block';
    state.pendingNewsImage = n.image;
  } else {
    preview.style.display = 'none';
    preview.src = '';
    state.pendingNewsImage = '';
  }

  openModal('addNewsModal');
}

export async function saveNews() {
  if (!checkAdminOrAlert()) return;
  const title = document.getElementById('nTitle').value.trim();
  const cat = document.getElementById('nCat').value;
  const desc = document.getElementById('nDesc').value.trim();
  const fullContent = document.getElementById('nFullContent').value.trim();
  const featured = document.getElementById('nFeatured').value === '1';

  if (!title || !desc) return alert('Vui lòng điền đủ tiêu đề và mô tả!');

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

  const newsData = {
    title,
    cat,
    desc,
    fullContent,
    featured,
    image: state.pendingNewsImage,
    date: state.currentEditId ? (appNews.find(x => x.id === state.currentEditId)?.date || dateStr) : dateStr
  };

  try {
    let res;
    if (state.currentEditId) {
      res = await fetch(`${API_URL}/news/${state.currentEditId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newsData)
      });
    } else {
      res = await fetch(`${API_URL}/news`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newsData)
      });
    }
    const result = await res.json();
    if (!result.success) {
      alert('Lỗi từ server: ' + (result.message || 'Không xác định'));
      return;
    }
    await loadData();
    closeModal('addNewsModal');
    renderNews();
    import('./home.js').then(module => module.renderAdminStats());
  } catch(e) {
    alert('Lỗi kết nối server: ' + e.message);
  }
}

export async function deleteNews(id) {
  if (!checkAdminOrAlert()) return;
  if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) return;
  try {
    const res = await fetch(`${API_URL}/news/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const result = await res.json();
    if (!result.success) {
      alert('Lỗi từ server: ' + (result.message || 'Không xác định'));
      return;
    }
    await loadData();
    renderNews();
    import('./home.js').then(module => module.renderAdminStats());
  } catch(e) {
    alert('Lỗi kết nối server: ' + e.message);
  }
}
