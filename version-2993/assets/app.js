import { H as Hls } from './hls-vendor.js';

function qs(root, sel) {
  return root.querySelector(sel);
}

function qsa(root, sel) {
  return Array.from(root.querySelectorAll(sel));
}

function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  mobileNav.addEventListener('click', (event) => {
    const target = event.target.closest('a');
    if (target) {
      mobileNav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) return;

  const slides = qsa(carousel, '[data-hero-slide]');
  const dots = qsa(carousel, '[data-hero-dot]');
  const prev = qs(carousel, '[data-hero-prev]');
  const next = qs(carousel, '[data-hero-next]');

  if (slides.length <= 1) return;

  let current = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (current < 0) current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === current);
      slide.setAttribute('aria-hidden', String(idx !== current));
    });
    dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === current));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener('click', () => {
    show(current - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(current + 1);
    start();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      show(idx);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);

  show(current);
  start();
}

function initFilters() {
  qsa(document, '[data-filter-input]').forEach((input) => {
    const scope = input.closest('[data-filter-scope]') || document;
    const items = qsa(scope, '[data-filter-card]');
    const empty = qs(scope, '[data-filter-empty]');
    const count = qs(scope, '[data-filter-count]');
    const select = qs(scope, '[data-sort-select]');

    const apply = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      items.forEach((item) => {
        const haystack = [
          item.dataset.title || '',
          item.dataset.summary || '',
          item.dataset.genre || '',
          item.dataset.region || '',
          item.dataset.year || '',
          item.dataset.tags || ''
        ].join(' ').toLowerCase();

        const match = !query || haystack.includes(query);
        item.hidden = !match;
        if (match) visible += 1;
      });

      if (count) count.textContent = String(visible);
      if (empty) empty.hidden = visible !== 0;
    };

    if (select) {
      select.addEventListener('change', () => {
        const mode = select.value;
        const sorted = [...items].sort((a, b) => {
          const ya = Number(a.dataset.year || 0);
          const yb = Number(b.dataset.year || 0);
          const ta = (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
          if (mode === 'title') return ta;
          if (mode === 'old') return ya - yb || ta;
          return yb - ya || ta;
        });

        const parent = items[0]?.parentElement;
        if (!parent) return;
        sorted.forEach((item) => parent.appendChild(item));
      });
    }

    input.addEventListener('input', apply);
    apply();
  });
}

function initPlayers() {
  qsa(document, 'video[data-stream]').forEach((video) => {
    const src = video.dataset.stream;
    const wrapper = video.closest('[data-player-wrap]');
    const overlay = wrapper ? qs(wrapper, '[data-play-trigger]') : null;

    if (!src) return;

    const attach = () => {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    };

    attach();

    overlay?.addEventListener('click', async () => {
      try {
        await video.play();
        overlay.classList.add('is-hidden');
      } catch (_) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('play', () => {
      if (overlay) overlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', () => {
      if (overlay) overlay.classList.remove('is-hidden');
    });
  });
}

function initBackToTop() {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;

  const toggle = () => {
    button.hidden = window.scrollY < 680;
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  initPlayers();
  initBackToTop();
});
