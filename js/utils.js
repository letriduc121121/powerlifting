// js/utils.js — Common UI helpers and animations

import { state } from './api.js';

export function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });
  });
}

export function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
  state.currentEditId = null;
}

export function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      let id = '';
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v');
      } else if (parsed.hostname === 'youtu.be') {
        id = parsed.pathname.slice(1);
      } else if (parsed.pathname.startsWith('/embed/')) {
        id = parsed.pathname.replace('/embed/', '');
      }
      return id;
    }
  } catch (e) {}
  return null;
}

export function getGoogleDriveId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('drive.google.com')) {
      const match = parsed.pathname.match(/\/file\/d\/([^\/]+)/);
      if (match && match[1]) return match[1];
      
      const idParam = parsed.searchParams.get('id');
      if (idParam) return idParam;
    }
  } catch (e) {}
  return null;
}

export function observeReveal() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach((el) => observer.observe(el));
}

export function handlePreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const minDisplayMs = 400;
  const startTime = Date.now();

  function hidePreloader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDisplayMs - elapsed);
    setTimeout(() => {
      if (!preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        document.body.classList.add('loaded');
        setTimeout(() => { preloader.style.display = 'none'; }, 700);
      }
    }, remaining);
  }

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }

  // Safety fallback
  setTimeout(hidePreloader, 6000);
}

export function updateImgConfigPreview(key, src) {
  const capKey = key.charAt(0).toUpperCase() + key.slice(1);
  const preview = document.getElementById(`imgPreview${capKey}`);
  const clearBtn = document.getElementById(`imgClear${capKey}Btn`);

  if (!preview) return;

  if (src && src.length > 0) {
    preview.src = src;
    preview.style.display = 'block';
    if (clearBtn) clearBtn.style.display = 'inline-block';
  } else {
    preview.src = '';
    preview.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
  }
}

/**
 * Resizes and compresses an image file on the client side using HTML5 Canvas.
 * Returns a Promise resolving to a base64 string.
 */
export function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.7, forceJpeg = true } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File không phải là hình ảnh hợp lệ.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill white background for JPEG transparent conversion
        let mimeType = file.type;
        if (forceJpeg || file.type === 'image/jpeg') {
          mimeType = 'image/jpeg';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL(mimeType, quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

