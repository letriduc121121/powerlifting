// js/gioi-thieu.js — Beginner training roadmap timeline logic

import { appData, saveData } from './api.js';
import { openModal, closeModal, observeReveal } from './utils.js';
import { checkAdminOrAlert } from './auth.js';

export function renderBeginnerRoadmap() {
  const container = document.getElementById('beginnerRoadmapCards');
  if (!container) return;
  if (!appData.beginnerRoadmap || appData.beginnerRoadmap.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); padding: 24px 0;">Chưa có bước lộ trình nào.</p>';
    return;
  }
  container.innerHTML = appData.beginnerRoadmap.map(r => `
    <div class="tm-roadmap-item reveal">
      <div class="week-col">${r.week}</div>
      <div class="content-col">
        <h4>${r.title}</h4>
        <p>${r.content}</p>
        <div class="card-admin-btns">
          <button class="btn-ghost-sm" onclick="editRoadmap('beginner', ${r.id})">✏️ Sửa</button>
          <button class="btn-ghost-sm" style="color:#EA4335" onclick="deleteRoadmap('beginner', ${r.id})">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
  observeReveal();
}

// Module states
let currentRoadmapTarget = 'beginner';
let currentEditId = null;

export function openAddRoadmapModal(target) {
  if (!checkAdminOrAlert()) return;
  currentRoadmapTarget = target;
  currentEditId = null;
  document.getElementById('addRoadmapTitle').textContent = target === 'beginner' 
    ? 'Thêm Bước Lộ Trình Cho Người Mới' 
    : 'Thêm Tuần Chuẩn Bị Thi Đấu';
  document.getElementById('rmWeekStart').value = '';
  document.getElementById('rmWeekEnd').value = '';
  document.getElementById('rmWeekError').style.display = 'none';
  document.getElementById('rmTitle').value = '';
  document.getElementById('rmContent').value = '';
  openModal('addRoadmapModal');
}

export function editRoadmap(target, id) {
  if (!checkAdminOrAlert()) return;
  currentRoadmapTarget = target;
  currentEditId = id;
  const list = target === 'beginner' ? appData.beginnerRoadmap : appData.tournamentRoadmap;
  const item = list.find(r => r.id === id);
  if (!item) return;

  document.getElementById('addRoadmapTitle').textContent = 'Chỉnh Sửa Lộ Trình';
  document.getElementById('rmTitle').value = item.title;
  document.getElementById('rmContent').value = item.content;
  document.getElementById('rmWeekError').style.display = 'none';

  // Parse week range "Tuần X-Y" or "Tuần X"
  const cleanWeek = item.week.replace('Tuần', '').trim();
  const parts = cleanWeek.split(/[–\-]/);
  document.getElementById('rmWeekStart').value = parts[0] ? parts[0].trim() : '';
  document.getElementById('rmWeekEnd').value = parts[1] ? parts[1].trim() : '';

  openModal('addRoadmapModal');
}

export function parseWeekRange(str) {
  const parts = str.replace('Tuần', '').trim().split(/[–\-]/);
  const f = parseInt(parts[0].trim(), 10);
  const t = parts[1] ? parseInt(parts[1].trim(), 10) : f;
  return { from: f, to: t };
}

export function saveRoadmap() {
  if (!checkAdminOrAlert()) return;
  const startVal = document.getElementById('rmWeekStart').value.trim();
  const endVal = document.getElementById('rmWeekEnd').value.trim();
  const title = document.getElementById('rmTitle').value.trim();
  const content = document.getElementById('rmContent').value.trim();
  const errorEl = document.getElementById('rmWeekError');

  if (!startVal || !title || !content) {
    alert('Vui lòng điền các trường bắt buộc!');
    return;
  }

  const from = parseInt(startVal, 10);
  const to = endVal ? parseInt(endVal, 10) : from;

  if (to < from) {
    errorEl.textContent = `Tuần kết thúc (${to}) không được nhỏ hơn tuần bắt đầu (${from})!`;
    errorEl.style.display = 'block';
    return;
  }

  const weekStr = from === to ? `Tuần ${from}` : `Tuần ${from}–${to}`;
  const list = currentRoadmapTarget === 'beginner' ? appData.beginnerRoadmap : appData.tournamentRoadmap;

  // Validation: Avoid overlapping intervals
  const isOverlap = list.find(r => {
    if (r.id === currentEditId) return false;
    const interval = parseWeekRange(r.week);
    return from <= interval.to && to >= interval.from;
  });

  if (isOverlap) {
    errorEl.textContent = `Khoảng thời gian này trùng lặp với "${isOverlap.week}" đã tồn tại!`;
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';

  if (currentEditId) {
    const item = list.find(r => r.id === currentEditId);
    if (item) {
      item.week = weekStr;
      item.title = title;
      item.content = content;
    }
  } else {
    list.push({
      id: Date.now(),
      week: weekStr,
      title: title,
      content: content
    });
  }

  // Sort list chronologically based on weeks
  list.sort((a, b) => parseWeekRange(a.week).from - parseWeekRange(b.week).from);

  saveData();
  closeModal('addRoadmapModal');
  
  if (currentRoadmapTarget === 'beginner') {
    renderBeginnerRoadmap();
  } else {
    // Import and update tournament roadmap dynamically to decouple imports
    import('./giai-dau.js').then(module => module.renderTournamentRoadmap());
  }
}

export function deleteRoadmap(target, id) {
  if (!checkAdminOrAlert()) return;
  if (!confirm('Bạn có chắc chắn muốn xóa bước lộ trình này?')) return;
  if (target === 'beginner') {
    appData.beginnerRoadmap = appData.beginnerRoadmap.filter(r => r.id !== id);
    renderBeginnerRoadmap();
  } else {
    appData.tournamentRoadmap = appData.tournamentRoadmap.filter(r => r.id !== id);
    import('./giai-dau.js').then(module => module.renderTournamentRoadmap());
  }
  saveData();
}
