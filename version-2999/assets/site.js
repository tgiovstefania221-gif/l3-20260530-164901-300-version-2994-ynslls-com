(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (prev) prev.addEventListener('click', function () { showSlide(current - 1); });
  if (next) next.addEventListener('click', function () { showSlide(current + 1); });
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { showSlide(i); });
  });
  if (slides.length > 1) {
    setInterval(function () { showSlide(current + 1); }, 6500);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(searchInputs.map(function (input) { return input.value; }).join(' '));
    var words = normalize(query + ' ' + activeFilter).split(/\s+/).filter(Boolean);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var ok = words.every(function (word) { return haystack.indexOf(word) !== -1; });
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    var note = document.querySelector('.empty-note');
    if (note) note.style.display = visible ? 'none' : 'block';
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });

  function setupPlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('.play-trigger');
    if (!video || !button) return;
    var source = video.getAttribute('data-video-url');
    var ready = false;

    function load() {
      if (ready || !source) return;
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      load();
      root.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () { root.classList.add('is-playing'); });
    video.addEventListener('click', function () {
      if (!ready) start();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(setupPlayer);
})();
