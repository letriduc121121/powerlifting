// js/app.js — Application Entry Point and Global Window Bindings

import { loadData, checkAuthStatus, state } from './api.js';
import { openModal, closeModal, observeReveal, handlePreloader } from './utils.js';
import { openLoginModal, doLogin, logout } from './auth.js';
import { renderHero, editHeroField, saveHeroField, openImageConfigModal, handleImageUrlChange, uploadConfigImage, clearConfigImage, changeVideoStatsPage, changeNewsStatsPage } from './home.js';
import { renderBeginnerRoadmap, openAddRoadmapModal, editRoadmap, saveRoadmap, deleteRoadmap } from './gioi-thieu.js';
import { renderTagFilter, filterByVideoTag, renderVideos, openVideoViewer, closeVideoViewer, switchVideoTab, handleLocalVideoSelect, handleTagInput, removeVideoTag, addSuggestedTag, saveVideo, editVideo, deleteVideo, previewVideoThumbnail, openAddVideoModal, changeVideoPage } from './huong-dan.js';
import { renderEvents, renderPrizes, renderTournamentRoadmap, renderRegLink, openAddEventModal, editEvent, saveEvent, deleteEvent, openPrizesModal, savePrizes, openRegLinkModal, saveRegLink } from './giai-dau.js';
import { renderNewsCategories, filterNewsByCategory, renderNews, changeNewsPage, openNewsDetail, closeNewsDetail, openAddNewsModal, editNews, saveNews, deleteNews, previewNewsImage, bindNewsSearch } from './tin-tuc.js';
import { toggleChat, sendChatMessage, sendQuickReply } from './chatbot.js';

// Bind functions to window so that inline HTML handlers (onclick="...") continue to work
window.openModal = openModal;
window.closeModal = closeModal;
window.openLoginModal = openLoginModal;
window.doLogin = doLogin;
window.logout = logout;
window.editHeroField = editHeroField;
window.saveHeroField = saveHeroField;
window.openAddRoadmapModal = openAddRoadmapModal;
window.editRoadmap = editRoadmap;
window.saveRoadmap = saveRoadmap;
window.deleteRoadmap = deleteRoadmap;
window.renderTagFilter = renderTagFilter;
window.filterByVideoTag = filterByVideoTag;
window.openVideoViewer = openVideoViewer;
window.closeVideoViewer = closeVideoViewer;
window.switchVideoTab = switchVideoTab;
window.handleLocalVideoSelect = handleLocalVideoSelect;
window.handleTagInput = handleTagInput;
window.removeVideoTag = removeVideoTag;
window.addSuggestedTag = addSuggestedTag;
window.saveVideo = saveVideo;
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.previewVideoThumbnail = previewVideoThumbnail;
window.openAddVideoModal = openAddVideoModal;
window.changeVideoPage = changeVideoPage;
window.openAddEventModal = openAddEventModal;
window.editEvent = editEvent;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.openPrizesModal = openPrizesModal;
window.savePrizes = savePrizes;
window.openRegLinkModal = openRegLinkModal;
window.saveRegLink = saveRegLink;
window.filterNewsByCategory = filterNewsByCategory;
window.changeNewsPage = changeNewsPage;
window.openNewsDetail = openNewsDetail;
window.closeNewsDetail = closeNewsDetail;
window.openAddNewsModal = openAddNewsModal;
window.editNews = editNews;
window.saveNews = saveNews;
window.deleteNews = deleteNews;
window.previewNewsImage = previewNewsImage;
window.toggleChat = toggleChat;
window.sendChatMessage = sendChatMessage;
window.sendQuickReply = sendQuickReply;
window.openImageConfigModal = openImageConfigModal;
window.handleImageUrlChange = handleImageUrlChange;
window.uploadConfigImage = uploadConfigImage;
window.clearConfigImage = clearConfigImage;
window.changeVideoStatsPage = changeVideoStatsPage;
window.changeNewsStatsPage = changeNewsStatsPage;

export function renderAll() {
  // Guard: only render if we're on the main landing page
  if (!document.getElementById('heroDate')) return;
  renderHero();
  renderBeginnerRoadmap();
  renderEvents();
  renderPrizes();
  renderTournamentRoadmap();
  renderRegLink();
  renderTagFilter();
  renderVideos();
  renderNewsCategories();
  renderNews();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Mobile navigation menu toggler
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.getElementById('navLinks');
  
  if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinksEl.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinksEl.classList.remove('open');
      });
    });
  }
}

// Window Scroll active nav tracker
function initScrollTracker() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateActiveNavLink() {
  const sections = ['home', 'gioi-thieu', 'lo-trinh-moi', 'huong-dan', 'giai-dau', 'tin-tuc', 'adminStatsSection'];
  const currentY = window.scrollY + 90;

  sections.forEach(id => {
    const section = document.getElementById(id);
    const link = document.querySelector(`.nav-link[data-sec="${id}"]`);
    if (!section || !link) return;

    if (currentY >= section.offsetTop && currentY < section.offsetTop + section.offsetHeight) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

// Anchor tag smooth scroll behaviors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 72,
          behavior: 'smooth'
        });
      }
    });
  });
}

// App Initialization
async function init() {
  // 1. Start preloader animation
  handlePreloader();

  // 2. Sync database data
  await loadData();
  
  // 3. Authenticate session
  await checkAuthStatus();
  
  // 4. Render layout components
  renderAll();
  
  // 5. Setup search and scroll actions
  bindNewsSearch();
  initMobileNav();
  initScrollTracker();
  initSmoothScroll();
  observeReveal();
}

window.addEventListener('DOMContentLoaded', init);
