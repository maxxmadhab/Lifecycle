/**
 * HIMACHAL PROVENANCE - LIFECYCLE INTERACTION SYSTEM
 * Viewfinder Camcorder Modals, Dynamic QR Code & Smooth Provenance Strips
 */

document.addEventListener('DOMContentLoaded', () => {
  initModalLightbox();
  initHorizontalStrips();
  initTimecodes();
  initGeoTagModal();
  initDynamicQRCodes();
});

/* ── Lightbox Viewfinder Modal ──────────────────────────────── */
function initModalLightbox() {
  const overlay = document.getElementById('viewfinderModal');
  if (!overlay) return;

  const closeBtn = overlay.querySelector('.modal-close-btn');
  const mediaContainer = overlay.querySelector('.modal-media-wrap');
  const titleEl = overlay.querySelector('.modal-title');
  const descEl = overlay.querySelector('.modal-desc');
  const tcEl = overlay.querySelector('.modal-tc');

  function openModal(data) {
    titleEl.textContent = data.title || 'Provenance Viewfinder';
    descEl.textContent = data.desc || '';
    tcEl.textContent = data.timecode || '00:00:12:08';

    mediaContainer.innerHTML = '';

    if (data.type === 'video') {
      const lowerSrc = (data.src || '').toLowerCase();
      if (data.src && (data.src.includes('youtube.com') || data.src.includes('youtu.be'))) {
        const iframe = document.createElement('iframe');
        iframe.src = data.src.replace('watch?v=', 'embed/') + '?autoplay=1&mute=0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        mediaContainer.appendChild(iframe);
      } else if (lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.webm') || lowerSrc.endsWith('.mov') || lowerSrc.endsWith('.m4v')) {
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'auto';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.borderRadius = '12px';

        // Provide both MP4 (standard web H.264) and MOV sources for 100% device compatibility
        const mp4Src = data.src.replace(/\.mov$/i, '.mp4');
        const sourceMp4 = document.createElement('source');
        sourceMp4.src = mp4Src;
        sourceMp4.type = 'video/mp4';
        video.appendChild(sourceMp4);

        if (data.src.toLowerCase().endsWith('.mov')) {
          const sourceMov = document.createElement('source');
          sourceMov.src = data.src;
          sourceMov.type = 'video/quicktime';
          video.appendChild(sourceMov);
        }

        mediaContainer.appendChild(video);
        video.play().catch(() => {
          // Autoplay with sound might be blocked by browser policy; user can click play
        });
      } else {
        // High-res preview fallback
        const img = document.createElement('img');
        img.src = data.src || '';
        img.alt = data.title || '';
        mediaContainer.appendChild(img);
      }
    } else {
      const img = document.createElement('img');
      img.src = data.src || '';
      img.alt = data.title || '';
      mediaContainer.appendChild(img);
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    const v = mediaContainer.querySelector('video');
    if (v) {
      v.pause();
      v.src = '';
      v.load();
    }
    mediaContainer.innerHTML = '';
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Attach click listener to all .cam elements with data-src
  document.querySelectorAll('.cam').forEach((card) => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-src') || card.querySelector('img')?.getAttribute('src');
      const title = card.getAttribute('data-title') || card.querySelector('.lab span')?.textContent;
      const desc = card.getAttribute('data-desc') || card.querySelector('.tg')?.textContent;
      const type = card.classList.contains('v') ? 'video' : 'photo';
      const timecode = card.querySelector('.tc')?.textContent;

      openModal({ src, title, desc, type, timecode });
    });
  });
}

/* ── Smooth Drag / Wheel for Media Strips ───────────────────── */
function initHorizontalStrips() {
  const strips = document.querySelectorAll('.strip');
  strips.forEach((strip) => {
    let isDown = false;
    let startX, scrollLeft;

    strip.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });

    strip.addEventListener('mouseleave', () => {
      isDown = false;
    });

    strip.addEventListener('mouseup', () => {
      isDown = false;
    });

    strip.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      const walk = (x - startX) * 1.5;
      strip.scrollLeft = scrollLeft - walk;
    });
  });
}

/* ── Live Rolling Camcorder Timecodes ───────────────────────── */
function initTimecodes() {
  const tcs = document.querySelectorAll('.cam .tc');
  if (!tcs.length) return;

  let frames = 8;
  let seconds = 12;

  setInterval(() => {
    frames = (frames + 1) % 24;
    if (frames === 0) {
      seconds = (seconds + 1) % 60;
    }
    const fStr = String(frames).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    tcs.forEach((tc) => {
      tc.textContent = `00:00:${sStr}:${fStr}`;
    });
  }, 1000 / 24);
}

/* ── Geo-Tag Modal & Print ──────────────────────────────────── */
function initGeoTagModal() {
  const printBtns = document.querySelectorAll('.btn-print-tag');
  printBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      window.print();
    });
  });
}

/* ── Dynamic Live Domain QR Codes ──────────────────────────── */
function initDynamicQRCodes() {
  const isHttp = window.location.protocol.startsWith('http');
  const baseUrl = isHttp && !window.location.host.includes('localhost') 
    ? window.location.origin 
    : 'https://lifecycle-gold.vercel.app';

  // On individual product pages (jacket.html, sweater.html, gloves.html, scarf.html)
  const mainQrBox = document.querySelector('.qr-box img');
  if (mainQrBox) {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    const targetUrl = isHttp && !window.location.host.includes('localhost')
      ? window.location.href.split('#')[0].split('?')[0]
      : `${baseUrl}/${pageName}`;
    mainQrBox.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=17-14-0F&bgcolor=F2-EE-E6&margin=2&data=${encodeURIComponent(targetUrl)}`;
  }

  // On index.html (the Master Hub cards)
  document.querySelectorAll('.hub-card').forEach((card) => {
    const href = card.getAttribute('href');
    const miniQr = card.querySelector('.hub-qr-mini img');
    if (miniQr && href) {
      const fullProductUrl = `${baseUrl}/${href.replace(/^\//, '')}`;
      miniQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=17-14-0F&bgcolor=F2-EE-E6&margin=1&data=${encodeURIComponent(fullProductUrl)}`;
    }
  });
}
