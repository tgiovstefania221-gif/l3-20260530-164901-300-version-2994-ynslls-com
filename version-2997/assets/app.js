const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMenu() {
  const button = $('.nav-toggle');
  const links = $('.nav-links');
  if (!button || !links) return;
  button.addEventListener('click', () => {
    links.classList.toggle('is-open');
  });
}

function initHero() {
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  if (!slides.length || !dots.length) return;
  let current = 0;
  const show = (index) => {
    current = index % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  setInterval(() => show(current + 1), 5200);
}

function initFilters() {
  const panel = $('[data-filter-panel]');
  if (!panel) return;
  const cards = $$('.js-card');
  const q = $('[data-filter-keyword]');
  const type = $('[data-filter-type]');
  const region = $('[data-filter-region]');
  const year = $('[data-filter-year]');
  const apply = () => {
    const keyword = (q?.value || '').trim().toLowerCase();
    const typeValue = type?.value || '';
    const regionValue = region?.value || '';
    const yearValue = year?.value || '';
    cards.forEach((card) => {
      const hay = (card.dataset.title + ' ' + card.dataset.tags + ' ' + card.dataset.genre).toLowerCase();
      const okKeyword = !keyword || hay.includes(keyword);
      const okType = !typeValue || card.dataset.type === typeValue;
      const okRegion = !regionValue || card.dataset.region === regionValue;
      const okYear = !yearValue || card.dataset.year === yearValue;
      card.style.display = okKeyword && okType && okRegion && okYear ? '' : 'none';
    });
  };
  [q, type, region, year].forEach((control) => {
    if (control) control.addEventListener('input', apply);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHero();
  initFilters();
});
