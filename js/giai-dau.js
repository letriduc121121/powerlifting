// js/giai-dau.js — Tournament, events, prizes and register CTA rendering

import { appData, saveData, state, DEFAULT_DATA } from './api.js';
import { openModal, closeModal, observeReveal } from './utils.js';
import { checkAdminOrAlert } from './auth.js';

export function renderEvents() {
  const container = document.getElementById('eventsRow');
  if (!container) return;
  if (!appData.events || appData.events.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">Chưa có nội dung thi đấu nào.</p>';
    return;
  }
  container.innerHTML = appData.events.map((e, index) => `
    <div class="event-card reveal">
      <div class="ec-num">0${index + 1}</div>
      <span class="ec-icon">${e.icon || '🏋️'}</span>
      <h4>${e.name}</h4>
      <p>${e.desc}</p>
      <div class="card-admin-btns">
        <button class="btn-ghost-sm" onclick="editEvent(${e.id})">✏️ Sửa</button>
        <button class="btn-ghost-sm" style="color:#EA4335" onclick="deleteEvent(${e.id})">🗑</button>
      </div>
    </div>
  `).join('');
  observeReveal();
}

export function renderPrizes() {
  const container = document.getElementById('prizesRow');
  if (!container) return;
  const prizes = appData.prizes || DEFAULT_DATA.prizes;
  
  container.innerHTML = `
    <div class="prize-card silver">
      <div class="p-pos">2</div>
      <div class="p-medal">🥈</div>
      <h4>${prizes.silver?.title || 'Á Quân'}</h4>
      <p class="p-money">${prizes.silver?.amount || '3.000.000đ'}</p>
      <small>${prizes.silver?.desc || 'Mỗi hạng cân'}</small>
      <div class="card-admin-btns">
        <button class="btn-ghost-sm" onclick="openPrizesModal()">✏️ Sửa</button>
      </div>
    </div>
    <div class="prize-card gold">
      <div class="p-pos">1</div>
      <div class="p-medal">🥇</div>
      <h4>${prizes.gold?.title || 'Vô Địch'}</h4>
      <p class="p-money">${prizes.gold?.amount || '5.000.000đ'}</p>
      <small>${prizes.gold?.desc || 'Mỗi hạng cân'}</small>
      <div class="card-admin-btns">
        <button class="btn-ghost-sm" onclick="openPrizesModal()">✏️ Sửa</button>
      </div>
    </div>
    <div class="prize-card bronze">
      <div class="p-pos">3</div>
      <div class="p-medal">🥉</div>
      <h4>${prizes.bronze?.title || 'Hạng Ba'}</h4>
      <p class="p-money">${prizes.bronze?.amount || '1.500.000đ'}</p>
      <small>${prizes.bronze?.desc || 'Mỗi hạng cân'}</small>
      <div class="card-admin-btns">
        <button class="btn-ghost-sm" onclick="openPrizesModal()">✏️ Sửa</button>
      </div>
    </div>
  `;
}

export function renderTournamentRoadmap() {
  const container = document.getElementById('tmRoadmap');
  if (!container) return;
  if (!appData.tournamentRoadmap || appData.tournamentRoadmap.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); padding: 24px 0;">Chưa có lộ trình tuần.</p>';
    return;
  }
  container.innerHTML = appData.tournamentRoadmap.map(r => `
    <div class="tm-roadmap-item reveal">
      <div class="week-col">${r.week}</div>
      <div class="content-col">
        <h4>${r.title}</h4>
        <p>${r.content}</p>
        <div class="card-admin-btns">
          <button class="btn-ghost-sm" onclick="editRoadmap('tournament', ${r.id})">✏️ Sửa</button>
          <button class="btn-ghost-sm" style="color:#EA4335" onclick="deleteRoadmap('tournament', ${r.id})">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
  observeReveal();
}

export function renderRegLink() {
  const savedLink = appData.regLink || '#';
  const btn = document.getElementById('regLinkBtn');
  if (btn) btn.href = savedLink;
}

// Events CRUD actions
export function openAddEventModal() {
  if (!checkAdminOrAlert()) return;
  state.currentEditId = null;
  document.getElementById('addEventTitle').textContent = 'Thêm Nội Dung Thi Đấu';
  document.getElementById('evName').value = '';
  document.getElementById('evIcon').value = '';
  document.getElementById('evDesc').value = '';
  openModal('addEventModal');
}

export function editEvent(id) {
  if (!checkAdminOrAlert()) return;
  state.currentEditId = id;
  const e = appData.events.find(x => x.id === id);
  if (!e) return;
  document.getElementById('addEventTitle').textContent = 'Chỉnh Sửa Nội Dung';
  document.getElementById('evName').value = e.name;
  document.getElementById('evIcon').value = e.icon;
  document.getElementById('evDesc').value = e.desc;
  openModal('addEventModal');
}

export function saveEvent() {
  if (!checkAdminOrAlert()) return;
  const name = document.getElementById('evName').value.trim();
  const icon = document.getElementById('evIcon').value.trim() || '🏋️';
  const desc = document.getElementById('evDesc').value.trim();

  if (!name || !desc) {
    alert('Vui lòng điền đủ tên nội dung và mô tả!');
    return;
  }

  if (state.currentEditId) {
    const e = appData.events.find(x => x.id === state.currentEditId);
    if (e) {
      e.name = name;
      e.icon = icon;
      e.desc = desc;
    }
  } else {
    appData.events.push({
      id: Date.now(),
      name,
      icon,
      desc
    });
  }

  saveData();
  renderEvents();
  closeModal('addEventModal');
}

export function deleteEvent(id) {
  if (!checkAdminOrAlert()) return;
  if (!confirm('Bạn có chắc chắn muốn xóa nội dung thi đấu này?')) return;
  appData.events = appData.events.filter(e => e.id !== id);
  saveData();
  renderEvents();
}

// Prizes and registration links config
export function openPrizesModal() {
  if (!checkAdminOrAlert()) return;
  const prizes = appData.prizes || DEFAULT_DATA.prizes;
  document.getElementById('prizeGoldAmt').value = prizes.gold?.amount || '';
  document.getElementById('prizeGoldDesc').value = prizes.gold?.desc || '';
  document.getElementById('prizeSilverAmt').value = prizes.silver?.amount || '';
  document.getElementById('prizeSilverDesc').value = prizes.silver?.desc || '';
  document.getElementById('prizeBronzeAmt').value = prizes.bronze?.amount || '';
  document.getElementById('prizeBronzeDesc').value = prizes.bronze?.desc || '';
  openModal('prizesModal');
}

export function savePrizes() {
  if (!checkAdminOrAlert()) return;
  appData.prizes = {
    gold: { title: 'Vô Địch', amount: document.getElementById('prizeGoldAmt').value.trim(), desc: document.getElementById('prizeGoldDesc').value.trim() },
    silver: { title: 'Á Quân', amount: document.getElementById('prizeSilverAmt').value.trim(), desc: document.getElementById('prizeSilverDesc').value.trim() },
    bronze: { title: 'Hạng Ba', amount: document.getElementById('prizeBronzeAmt').value.trim(), desc: document.getElementById('prizeBronzeDesc').value.trim() }
  };
  saveData();
  renderPrizes();
  closeModal('prizesModal');
}

export function openRegLinkModal() {
  if (!checkAdminOrAlert()) return;
  document.getElementById('regLinkInput').value = appData.regLink || '';
  openModal('regLinkModal');
}

export function saveRegLink() {
  if (!checkAdminOrAlert()) return;
  const link = document.getElementById('regLinkInput').value.trim();
  appData.regLink = link || DEFAULT_DATA.regLink;
  saveData();
  renderRegLink();
  closeModal('regLinkModal');
}
