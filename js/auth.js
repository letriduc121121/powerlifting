// js/auth.js — Authentication and admin mode settings

import { API_URL, setAdminMode, isAdmin } from './api.js';
import { openModal, closeModal } from './utils.js';

export function checkAdminOrAlert() {
  if (!isAdmin) {
    alert('Bạn cần đăng nhập tài khoản Admin để thực hiện chức năng này!');
    return false;
  }
  return true;
}

export function openLoginModal() {
  openModal('loginModal');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').style.display = 'none';
}

export async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  if (!username || !password) {
    alert('Vui lòng nhập tên đăng nhập và mật khẩu!');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON.');
    }
    
    const result = await response.json();
    if (response.ok && result.success) {
      localStorage.setItem('admin_token', result.token);
      setAdminMode(true);
      closeModal('loginModal');
      // Import and render all
      const { renderAll } = await import('./app.js');
      renderAll();
      console.log('Admin login successful.');
    } else {
      document.getElementById('loginErr').textContent = result.message || 'Tài khoản hoặc mật khẩu không đúng!';
      document.getElementById('loginErr').style.display = 'block';
    }
  } catch (error) {
    console.error('Server auth request failed:', error);
    // Simple offline fallback
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('admin_token', 'offline_mode_token');
      setAdminMode(true);
      closeModal('loginModal');
      const { renderAll } = await import('./app.js');
      renderAll();
      alert('⚠️ Chế độ offline: Đã đăng nhập nhưng không kết nối được server. Các thay đổi sẽ không được lưu.');
    } else {
      document.getElementById('loginErr').textContent = 'Không kết nối được server! Lỗi: ' + error.message;
      document.getElementById('loginErr').style.display = 'block';
    }
  }
}

export async function logout() {
  localStorage.removeItem('admin_token');
  setAdminMode(false);
  const { renderAll } = await import('./app.js');
  renderAll();
  console.log('Logged out from admin session.');
}
