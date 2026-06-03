// js/home.js — Hero Section and Admin stats rendering

import { appData, appVideos, appNews, isAdmin, saveData, DEFAULT_DATA, state } from './api.js';
import { openModal, closeModal, updateImgConfigPreview, compressImage } from './utils.js';
import { checkAdminOrAlert } from './auth.js';


export function renderHero() {
  const heroDateEl = document.getElementById('heroDate');
  const heroLocationEl = document.getElementById('heroLocation');
  const infoCardDateEl = document.getElementById('infoCardDate');
  const infoCardLocationEl = document.getElementById('infoCardLocation');
  
  if (heroDateEl) heroDateEl.textContent = appData.heroDate;
  if (heroLocationEl) heroLocationEl.textContent = appData.heroLocation;
  if (infoCardDateEl) infoCardDateEl.textContent = appData.heroDate;
  if (infoCardLocationEl) infoCardLocationEl.textContent = appData.heroLocation;

  // Render info cards sub fields
  const infoCardTimeSubEl = document.getElementById('infoCardTimeSub');
  const infoCardLocationSubEl = document.getElementById('infoCardLocationSub');
  const infoCardWeightClassEl = document.getElementById('infoCardWeightClass');
  const infoCardWeightClassSubEl = document.getElementById('infoCardWeightClassSub');
  const infoCardTargetEl = document.getElementById('infoCardTarget');
  const infoCardTargetSubEl = document.getElementById('infoCardTargetSub');

  if (infoCardTimeSubEl) infoCardTimeSubEl.textContent = appData.infoTimeSub || '07:00 – 18:00';
  if (infoCardLocationSubEl) infoCardLocationSubEl.textContent = appData.infoLocationSub || 'Nhà thi đấu tỉnh';
  if (infoCardWeightClassEl) infoCardWeightClassEl.textContent = appData.infoWeightClass || 'Nam: 59, 66, 74, 83, 93, 105, 120, +120kg';
  if (infoCardWeightClassSubEl) infoCardWeightClassSubEl.textContent = appData.infoWeightClassSub || 'Nữ: 47, 52, 57, 63, 69, 76, 84, +84kg';
  if (infoCardTargetEl) infoCardTargetEl.textContent = appData.infoTarget || 'Mở rộng toàn quốc';
  if (infoCardTargetSubEl) infoCardTargetSubEl.textContent = appData.infoTargetSub || 'Từ 16 tuổi trở lên';

  // Render Intro texts
  const introTitleEl = document.getElementById('introTitle');
  const introDescEl = document.getElementById('introDesc');
  if (introTitleEl) introTitleEl.textContent = appData.introTitle || 'Powerlifting Là Gì?';
  if (introDescEl) introDescEl.textContent = appData.introDesc || '';

  // Render stats
  const statAthletesEl = document.getElementById('statAthletes');
  const statClassesEl = document.getElementById('statClasses');
  const statEventsEl = document.getElementById('statEvents');
  
  if (statAthletesEl) statAthletesEl.textContent = appData.statAthletes || '200+';
  if (statClassesEl) statClassesEl.textContent = appData.statClasses || '12';
  if (statEventsEl) statEventsEl.textContent = appData.statEvents || '3';

  // Dynamic Image Syncer
  const logoUrl = (appData.images && appData.images.logo) || '/images/logo.png';
  const heroBgUrl = (appData.images && appData.images.heroBg) || '/images/hero-bg.png';
  const chatbotLogoUrl = (appData.images && appData.images.chatbotLogo) || '/images/chatbot-logo.png';

  const logoImg = document.getElementById('navLogoImg');
  if (logoImg) logoImg.src = logoUrl;

  const footerLogoImg = document.getElementById('footerLogoImg');
  if (footerLogoImg) footerLogoImg.src = logoUrl;

  const chatToggleImg = document.getElementById('chatToggleMascot');
  if (chatToggleImg) chatToggleImg.src = chatbotLogoUrl;

  const chatHeaderImg = document.getElementById('chatHeaderMascot');
  if (chatHeaderImg) chatHeaderImg.src = chatbotLogoUrl;

  const heroSec = document.getElementById('home');
  if (heroSec && heroBgUrl) {
    heroSec.style.backgroundImage = `url("${heroBgUrl}")`;
    heroSec.style.backgroundSize = 'cover';
    heroSec.style.backgroundPosition = 'center';
  }
}

export function renderAdminStats() {
  const adminStatsSection = document.getElementById('adminStatsSection');
  if (!adminStatsSection) return;
  
  if (!isAdmin) {
    adminStatsSection.style.display = 'none';
    return;
  }
  
  adminStatsSection.style.display = 'block';
  
  const totalVideoViews = appVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalNewsViews = appNews.reduce((sum, n) => sum + (n.views || 0), 0);
  
  const videoEl = document.getElementById('totalVideoViews');
  const newsEl = document.getElementById('totalNewsViews');
  
  if (videoEl) videoEl.textContent = totalVideoViews.toLocaleString('vi-VN');
  if (newsEl) newsEl.textContent = totalNewsViews.toLocaleString('vi-VN');

  // Render video stats table
  const videoStatsBody = document.getElementById('videoStatsBody');
  if (videoStatsBody) {
    const sorted = [...appVideos].sort((a, b) => (b.views || 0) - (a.views || 0));
    const totalPages = Math.ceil(sorted.length / state.videoStatsItemsPerPage);
    const activePage = Math.min(state.currentVideoStatsPage, Math.max(1, totalPages));
    const startIndex = (activePage - 1) * state.videoStatsItemsPerPage;
    const paginatedItems = sorted.slice(startIndex, startIndex + state.videoStatsItemsPerPage);

    videoStatsBody.innerHTML = paginatedItems.length ? paginatedItems.map(v => `
      <tr>
        <td>${v.name}</td>
        <td>${(v.tags || []).map(t => `<span class="stats-tag">${t}</span>`).join('') || '—'}</td>
        <td><strong>👁️ ${(v.views || 0).toLocaleString('vi-VN')}</strong></td>
      </tr>
    `).join('') : '<tr><td colspan="3" style="color:var(--text-muted);text-align:center;padding:12px">Chưa có dữ liệu</td></tr>';

    renderStatsPagination('videoStatsPagination', totalPages, activePage, 'changeVideoStatsPage');
  }

  // Render news stats table
  const newsStatsBody = document.getElementById('newsStatsBody');
  if (newsStatsBody) {
    const sorted = [...appNews].sort((a, b) => (b.views || 0) - (a.views || 0));
    const totalPages = Math.ceil(sorted.length / state.newsStatsItemsPerPage);
    const activePage = Math.min(state.currentNewsStatsPage, Math.max(1, totalPages));
    const startIndex = (activePage - 1) * state.newsStatsItemsPerPage;
    const paginatedItems = sorted.slice(startIndex, startIndex + state.newsStatsItemsPerPage);

    newsStatsBody.innerHTML = paginatedItems.length ? paginatedItems.map(n => `
      <tr>
        <td>${n.title}</td>
        <td><span class="stats-cat">${n.cat}</span></td>
        <td>${n.date || '—'}</td>
        <td><strong>👁️ ${(n.views || 0).toLocaleString('vi-VN')}</strong></td>
      </tr>
    `).join('') : '<tr><td colspan="4" style="color:var(--text-muted);text-align:center;padding:12px">Chưa có dữ liệu</td></tr>';

    renderStatsPagination('newsStatsPagination', totalPages, activePage, 'changeNewsStatsPage');
  }
}

export function renderStatsPagination(elementId, totalPages, activePage, callbackName) {
  const container = document.getElementById(elementId);
  if (!container) return;
  
  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  let buttons = `
    <button class="page-btn" ${activePage === 1 ? 'disabled' : ''} onclick="${callbackName}(${activePage - 1})">
      Trước
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    buttons += `
      <button class="page-btn ${activePage === i ? 'active' : ''}" onclick="${callbackName}(${i})">
        ${i}
      </button>
    `;
  }

  buttons += `
    <button class="page-btn" ${activePage === totalPages ? 'disabled' : ''} onclick="${callbackName}(${activePage + 1})">
      Sau
    </button>
  `;

  container.innerHTML = buttons;
}

export function changeVideoStatsPage(page) {
  state.currentVideoStatsPage = page;
  renderAdminStats();
}

export function changeNewsStatsPage(page) {
  state.currentNewsStatsPage = page;
  renderAdminStats();
}

// Global scope tracker variables inside home module
let currentHeroKey = null;

export function editHeroField(key, label) {
  if (!isAdmin) return;
  currentHeroKey = key;
  document.getElementById('heroFieldModalTitle').textContent = label;
  document.getElementById('heroFieldLabel').textContent = label;
  
  const inputEl = document.getElementById('heroFieldInput');
  const textareaEl = document.getElementById('heroFieldTextarea');
  const containerEl = document.getElementById('heroFieldModalContainer');
  
  const isLargeText = key === 'introDesc' || key === 'infoWeightClass' || key === 'infoWeightClassSub';
  
  if (isLargeText) {
    inputEl.style.display = 'none';
    textareaEl.style.display = 'block';
    textareaEl.value = appData[key] || '';
    if (containerEl) containerEl.style.maxWidth = '600px';
  } else {
    textareaEl.style.display = 'none';
    inputEl.style.display = 'block';
    inputEl.value = appData[key] || '';
    if (containerEl) containerEl.style.maxWidth = '400px';
  }
  
  openModal('heroFieldModal');
}

export function saveHeroField() {
  if (!checkAdminOrAlert()) return;
  
  const isLargeText = currentHeroKey === 'introDesc' || currentHeroKey === 'infoWeightClass' || currentHeroKey === 'infoWeightClassSub';
  const elementId = isLargeText ? 'heroFieldTextarea' : 'heroFieldInput';
  const val = document.getElementById(elementId).value.trim();
  
  if (!val) {
    alert('Vui lòng nhập giá trị!');
    return;
  }
  appData[currentHeroKey] = val;
  saveData();
  renderHero();
  closeModal('heroFieldModal');
}

// System image upload & clear actions
export function openImageConfigModal() {
  if (!checkAdminOrAlert()) return;
  const images = appData.images || DEFAULT_DATA.images;
  
  document.getElementById('imgUrlLogo').value = images.logo || '';
  document.getElementById('imgUrlHeroBg').value = images.heroBg || '';
  document.getElementById('imgUrlChatbotLogo').value = images.chatbotLogo || '';
  document.getElementById('imgUrlNewsFallback').value = images.newsFallback || '';
  document.getElementById('imgUrlVideoFallback').value = images.videoFallback || '';

  document.getElementById('imgFileLogo').value = '';
  document.getElementById('imgFileHeroBg').value = '';
  document.getElementById('imgFileChatbotLogo').value = '';
  document.getElementById('imgFileNewsFallback').value = '';
  document.getElementById('imgFileVideoFallback').value = '';

  updateImgConfigPreview('logo', images.logo);
  updateImgConfigPreview('heroBg', images.heroBg);
  updateImgConfigPreview('chatbotLogo', images.chatbotLogo);
  updateImgConfigPreview('newsFallback', images.newsFallback);
  updateImgConfigPreview('videoFallback', images.videoFallback);

  openModal('imageConfigModal');
}

export function handleImageUrlChange(key, value) {
  if (!checkAdminOrAlert()) return;
  if (!appData.images) appData.images = {};
  appData.images[key] = value.trim();
  saveData();
  renderHero();
  updateImgConfigPreview(key, appData.images[key]);
}

export async function uploadConfigImage(key, input) {
  if (!checkAdminOrAlert()) return;
  const file = input.files[0];
  if (!file) return;

  try {
    let options = { maxWidth: 1200, maxHeight: 1200, quality: 0.75, forceJpeg: true };
    if (key === 'logo' || key === 'chatbotLogo') {
      options = { maxWidth: 500, maxHeight: 500, quality: 0.8, forceJpeg: false };
    } else if (key === 'heroBg') {
      options = { maxWidth: 1920, maxHeight: 1080, quality: 0.8, forceJpeg: true };
    }

    const base64 = await compressImage(file, options);
    if (!appData.images) appData.images = {};
    appData.images[key] = base64;
    await saveData();
    renderHero();
    updateImgConfigPreview(key, base64);
  } catch (error) {
    console.error('Lỗi nén ảnh cấu hình:', error);
    alert('Không thể tải ảnh: ' + error.message);
  }
}

export function clearConfigImage(key) {
  if (!checkAdminOrAlert()) return;
  const capKey = key.charAt(0).toUpperCase() + key.slice(1);
  document.getElementById(`imgFile${capKey}`).value = '';
  
  const defaultUrl = DEFAULT_DATA.images[key] || '';
  if (!appData.images) appData.images = {};
  appData.images[key] = defaultUrl;
  saveData();
  renderHero();
  
  document.getElementById(`imgUrl${capKey}`).value = defaultUrl;
  updateImgConfigPreview(key, defaultUrl);
}
