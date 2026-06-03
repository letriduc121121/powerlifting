// js/huong-dan.js — Video tutorials section, filter tags and video player popup

import { API_URL, getAuthHeaders, appVideos, appData, loadData, ALL_TAGS, state } from './api.js';
import { openModal, closeModal, observeReveal, getYouTubeId, getGoogleDriveId, compressImage } from './utils.js';
import { checkAdminOrAlert } from './auth.js';

export function renderTagFilter() {
  const activeTags = [...ALL_TAGS];
  appVideos.forEach(v => {
    if (v.tags) {
      v.tags.forEach(t => {
        if (!activeTags.includes(t)) activeTags.push(t);
      });
    }
  });

  const filterEl = document.getElementById('tagFilter');
  if (!filterEl) return;
  const tagsList = ['all', ...activeTags];
  filterEl.innerHTML = tagsList.map(t => `
    <button class="tag-btn ${t === state.activeVideoTag ? 'active' : ''}" onclick="filterByVideoTag('${t}')">
      ${t === 'all' ? 'Tất cả' : t}
    </button>
  `).join('');
}

export function filterByVideoTag(tag) {
  state.activeVideoTag = tag;
  state.currentVideoPage = 1;
  renderTagFilter();
  renderVideos();
}

export function renderVideos() {
  const gridEl = document.getElementById('videoGrid');
  if (!gridEl) return;
  
  const filtered = state.activeVideoTag === 'all' 
    ? appVideos 
    : appVideos.filter(v => v.tags && v.tags.includes(state.activeVideoTag));
    
  if (!filtered || filtered.length === 0) {
    gridEl.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1;">Chưa có video nào trong danh mục này.</p>';
    const pagEl = document.getElementById('videoPagination');
    if (pagEl) pagEl.style.display = 'none';
    return;
  }

  const totalPages = Math.ceil(filtered.length / state.videoItemsPerPage);
  const activePage = Math.min(state.currentVideoPage, Math.max(1, totalPages));
  
  const startIndex = (activePage - 1) * state.videoItemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + state.videoItemsPerPage);

  gridEl.innerHTML = paginatedItems.map(v => {
    const viewsCount = v.views || 0;
    return `
      <div class="video-card reveal" id="vc-${v.id}">
        <div class="video-thumb" id="thumb-${v.id}">
          ${getVideoEmbedHTML(v)}
        </div>
        <div class="video-info">
          <h4>${v.name}</h4>
          <div class="video-meta-row">
            <div class="video-tags">
              ${v.tags ? v.tags.map(t => `<span class="video-tag-chip">${t}</span>`).join('') : ''}
            </div>
            <span class="video-views-count" id="video-views-${v.id}">👁️ ${viewsCount} lượt xem</span>
          </div>
        </div>
        <div class="video-card-admin">
          <button class="btn-ghost-sm" onclick="editVideo(${v.id})">✏️</button>
          <button class="btn-ghost-sm" style="color:#EA4335" onclick="deleteVideo(${v.id})">🗑</button>
        </div>
      </div>
    `;
  }).join('');
  
  renderVideoPagination(totalPages, activePage);
  observeReveal();
}

export function renderVideoPagination(totalPages, activePage) {
  const container = document.getElementById('videoPagination');
  if (!container) return;
  
  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  let buttons = `
    <button class="page-btn" ${activePage === 1 ? 'disabled' : ''} onclick="changeVideoPage(${activePage - 1})">
      Trước
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    buttons += `
      <button class="page-btn ${activePage === i ? 'active' : ''}" onclick="changeVideoPage(${i})">
        ${i}
      </button>
    `;
  }

  buttons += `
    <button class="page-btn" ${activePage === totalPages ? 'disabled' : ''} onclick="changeVideoPage(${activePage + 1})">
      Sau
    </button>
  `;

  container.innerHTML = buttons;
}

export function changeVideoPage(page) {
  state.currentVideoPage = page;
  renderVideos();
  document.getElementById('huong-dan').scrollIntoView({ behavior: 'smooth' });
}

export function getVideoEmbedHTML(v) {
  if (v.localBlob) {
    return `<video class="local-video" controls onplay="incrementVideoView(${v.id})"><source src="${v.localBlob}"/></video>`;
  }
  if (v.url) {
    const ytId = getYouTubeId(v.url);
    if (ytId) {
      const thumbUrl = v.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      return `
        <div class="video-thumb-placeholder" style="background-image: url('${thumbUrl}'); background-size: cover; background-position: center; cursor: pointer;" onclick="openVideoViewer(${v.id})">
          <div class="play-circle" style="z-index: 2;">▶</div>
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); z-index: 1;"></div>
        </div>
      `;
    }
    
    const driveId = getGoogleDriveId(v.url);
    if (driveId) {
      const thumbStyle = v.thumbnail 
        ? `background-image: url('${v.thumbnail}'); background-size: cover; background-position: center;` 
        : `background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);`;
      return `
        <div class="video-thumb-placeholder" style="${thumbStyle} cursor: pointer;" onclick="openVideoViewer(${v.id})">
          <div class="play-circle" style="z-index: 2;">▶</div>
          ${v.thumbnail ? '' : '<div class="video-thumb-label" style="z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-size: 0.9rem;">📁 Google Drive<br>' + v.name + '</div>'}
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); z-index: 1;"></div>
        </div>
      `;
    }
  }
  
  const fallbackUrl = (appData.images && appData.images.videoFallback) || '/images/video-fallback.png';
  const thumbUrl = v.thumbnail || fallbackUrl;
  const styleStr = `background-image: url(${thumbUrl}); background-size: cover; background-position: center; cursor: pointer;`;
  return `
    <div class="video-thumb-placeholder" style="${styleStr}" onclick="openVideoViewer(${v.id})">
      <div class="play-circle" style="z-index: 2;">▶</div>
      <div class="video-thumb-label" style="z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${v.name}</div>
      <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: 1;"></div>
    </div>
  `;
}

export function playVideo(id, type, videoId) {
  incrementVideoView(id);
  const thumbDiv = document.getElementById(`thumb-${id}`);
  if (!thumbDiv) return;
  
  if (type === 'youtube') {
    thumbDiv.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (type === 'drive') {
    thumbDiv.innerHTML = `<iframe src="https://drive.google.com/file/d/${videoId}/preview" allow="autoplay" allowfullscreen></iframe>`;
  }
}

export function playYouTubeVideo(id, ytId) {
  playVideo(id, 'youtube', ytId);
}

export function getYouTubeEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      let id = '';
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v');
      } else if (parsed.hostname === 'youtu.be') {
        id = parsed.pathname.slice(1);
      } else if (parsed.pathname.startsWith('/embed/')) {
        return url;
      }
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.replace('/', '');
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch (e) {
    return url;
  }
}

export async function incrementVideoView(id) {
  if (state.viewedVideosThisSession.has(id)) return;
  state.viewedVideosThisSession.add(id);

  const v = appVideos.find(x => x.id === id);
  if (v) v.views = (v.views || 0) + 1;
  
  const viewSpan = document.getElementById(`video-views-${id}`);
  if (viewSpan && v) {
    viewSpan.innerText = `👁️ ${v.views} lượt xem`;
  }
  
  // Sync to home dashboard
  import('./home.js').then(module => module.renderAdminStats());
  
  try {
    await fetch(`${API_URL}/views/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'video', itemId: String(id) })
    });
  } catch (error) {
    console.error('Views sync failed:', error);
  }
}

export function openVideoViewer(id) {
  const video = appVideos.find(v => v.id === id);
  if (!video) return;

  const modal = document.getElementById('videoViewerModal');
  const container = document.getElementById('videoViewerContainer');
  const titleEl = document.getElementById('videoViewerTitle');
  const tagsEl = document.getElementById('videoViewerTags');

  if (!modal || !container || !titleEl || !tagsEl) return;

  titleEl.textContent = video.name;

  if (video.tags && video.tags.length > 0) {
    tagsEl.innerHTML = video.tags.map(tag => 
      `<span class="tag" style="display: inline-block; padding: 4px 12px; background: rgba(66,133,244,0.1); color: #4285f4; border-radius: 12px; font-size: 0.85rem; margin-right: 8px;">${tag}</span>`
    ).join('');
  } else {
    tagsEl.innerHTML = '';
  }

  let embedHTML = '';
  const ytId = getYouTubeId(video.url);
  if (ytId) {
    embedHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    const driveId = getGoogleDriveId(video.url);
    if (driveId) {
      embedHTML = `<iframe src="https://drive.google.com/file/d/${driveId}/preview" allow="autoplay" allowfullscreen></iframe>`;
    } else {
      const videoSrc = video.localBlob || video.url || '';
      embedHTML = `<video controls autoplay style="width: 100%; height: 100%; border-radius: 8px;"><source src="${videoSrc}" type="video/mp4">Your browser does not support the video tag.</video>`;
    }
  }

  container.innerHTML = embedHTML;
  incrementVideoView(id);

  const viewsValEl = document.getElementById('videoViewerCountVal');
  if (viewsValEl) {
    viewsValEl.textContent = (video.views || 0).toLocaleString('vi-VN');
  }

  openModal('videoViewerModal');
  document.body.style.overflow = 'hidden';
}

export function closeVideoViewer(event, forceClose = false) {
  if (!forceClose && event && event.target.closest('.video-viewer-modal')) {
    return;
  }

  const modal = document.getElementById('videoViewerModal');
  const container = document.getElementById('videoViewerContainer');

  if (!modal || !container) return;

  container.innerHTML = '';
  closeModal('videoViewerModal');
  document.body.style.overflow = '';
}

// Admin Video CRUD Actions
export function switchVideoTab(mode) {
  state.videoSrcMode = mode;
  document.getElementById('vTabUrl').classList.toggle('active', mode === 'url');
  document.getElementById('vTabLocal').classList.toggle('active', mode === 'local');
  document.getElementById('urlPanel').classList.toggle('active', mode === 'url');
  document.getElementById('localPanel').classList.toggle('active', mode === 'local');
}

export function handleLocalVideoSelect(input) {
  const file = input.files[0];
  if (!file) return;
  state.localVideoBlob = URL.createObjectURL(file);
  console.log('Local video blob URL created:', state.localVideoBlob);
}

export function handleTagInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addVideoTag();
  }
}

export function addVideoTag() {
  const input = document.getElementById('tagInput');
  const val = input.value.trim();
  if (val && !state.pendingTagsForVideo.includes(val)) {
    state.pendingTagsForVideo.push(val);
    renderTagsInVideoModal();
  }
  input.value = '';
}

export function removeVideoTag(tag) {
  state.pendingTagsForVideo = state.pendingTagsForVideo.filter(t => t !== tag);
  renderTagsInVideoModal();
}

export function addSuggestedTag(tag) {
  if (!state.pendingTagsForVideo.includes(tag)) {
    state.pendingTagsForVideo.push(tag);
    renderTagsInVideoModal();
  }
}

export function renderTagsInVideoModal() {
  const wrap = document.getElementById('tagsWrap');
  const input = document.getElementById('tagInput');
  if (!wrap || !input) return;
  
  wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
  
  state.pendingTagsForVideo.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${t}<button type="button" onclick="removeVideoTag('${t}')">×</button>`;
    wrap.insertBefore(chip, input);
  });
}

export function renderSuggestedVideoTags() {
  const container = document.getElementById('suggestedTags');
  if (!container) return;
  container.innerHTML = `
    <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-cond); letter-spacing:1px; margin-right:4px;">Gợi ý:</span>
    ${ALL_TAGS.map(t => `<button type="button" class="qr-btn" style="font-size:0.7rem; padding: 4px 10px;" onclick="addSuggestedTag('${t}')">${t}</button>`).join('')}
  `;
}

export async function previewVideoThumbnail(input) {
  const file = input.files[0];
  if (!file) return;

  try {
    const base64 = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.75, forceJpeg: true });
    state.pendingVideoThumbnail = base64;
    const preview = document.getElementById('vThumbnailPreview');
    if (preview) {
      preview.src = base64;
      preview.style.display = 'block';
    }
  } catch (error) {
    console.error('Lỗi nén ảnh thumbnail video:', error);
    alert('Không thể tải ảnh: ' + error.message);
  }
}

export function openAddVideoModal() {
  if (!checkAdminOrAlert()) return;
  state.currentEditId = null;
  state.pendingTagsForVideo = [];
  state.localVideoBlob = null;
  state.pendingVideoThumbnail = '';
  
  document.getElementById('addVideoTitle').textContent = 'Thêm Video Hướng Dẫn';
  document.getElementById('vName').value = '';
  document.getElementById('vUrl').value = '';
  document.getElementById('vFile').value = '';
  document.getElementById('vThumbnail').value = '';
  document.getElementById('vThumbnailPreview').style.display = 'none';
  
  switchVideoTab('url');
  renderTagsInVideoModal();
  renderSuggestedVideoTags();
  openModal('addVideoModal');
}

export function editVideo(id) {
  if (!checkAdminOrAlert()) return;
  state.currentEditId = id;
  const v = appVideos.find(x => x.id === id);
  if (!v) return;

  document.getElementById('addVideoTitle').textContent = 'Chỉnh Sửa Video';
  document.getElementById('vName').value = v.name;
  document.getElementById('vUrl').value = v.url || '';
  document.getElementById('vFile').value = '';
  document.getElementById('vThumbnail').value = '';
  state.localVideoBlob = v.localBlob || null;
  state.pendingTagsForVideo = [...(v.tags || [])];
  state.pendingVideoThumbnail = v.thumbnail || '';
  
  const preview = document.getElementById('vThumbnailPreview');
  if (v.thumbnail) {
    preview.src = v.thumbnail;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  switchVideoTab(v.localBlob ? 'local' : 'url');
  renderTagsInVideoModal();
  renderSuggestedVideoTags();
  openModal('addVideoModal');
}

export async function saveVideo() {
  if (!checkAdminOrAlert()) return;
  const name = document.getElementById('vName').value.trim();
  const url = document.getElementById('vUrl').value.trim();
  
  if (!name) return alert('Tên video không được để trống!');
  if (state.videoSrcMode === 'url' && !url) return alert('Link URL không được để trống!');
  if (state.videoSrcMode === 'local' && !state.localVideoBlob) return alert('Vui lòng chọn file video!');

  const videoData = {
    name,
    url: state.videoSrcMode === 'url' ? url : '',
    localBlob: state.videoSrcMode === 'local' ? state.localVideoBlob : null,
    thumbnail: state.pendingVideoThumbnail,
    tags: state.pendingTagsForVideo
  };

  try {
    let res;
    if (state.currentEditId) {
      res = await fetch(`${API_URL}/videos/${state.currentEditId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(videoData)
      });
    } else {
      res = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(videoData)
      });
    }
    const result = await res.json();
    if (!result.success) {
      alert('Lỗi từ server: ' + (result.message || 'Không xác định'));
      return;
    }
    await loadData();
    closeModal('addVideoModal');
    renderVideos();
    renderTagFilter();
    import('./home.js').then(module => module.renderAdminStats());
  } catch (error) {
    alert('Lỗi kết nối server: ' + error.message);
  }
}

export async function deleteVideo(id) {
  if (!checkAdminOrAlert()) return;
  if (!confirm('Bạn có chắc chắn muốn xóa video này?')) return;
  try {
    const res = await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const result = await res.json();
    if (!result.success) {
      alert('Lỗi từ server: ' + (result.message || 'Không xác định'));
      return;
    }
    await loadData();
    renderVideos();
    renderTagFilter();
    import('./home.js').then(module => module.renderAdminStats());
  } catch(e) {
    alert('Lỗi kết nối server: ' + e.message);
  }
}
