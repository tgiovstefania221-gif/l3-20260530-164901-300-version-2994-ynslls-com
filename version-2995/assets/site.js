(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-card-container]'));
    var searchInput = document.querySelector('[data-search-input]');
    var typeInput = document.querySelector('[data-type-input]');
    var sortSelect = document.querySelector('[data-sort-select]');

    if (!containers.length || (!searchInput && !typeInput && !sortSelect)) {
      return;
    }

    function cards() {
      return Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(searchInput && searchInput.value);
      var typeKeyword = normalize(typeInput && typeInput.value);
      cards().forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var typeText = normalize(card.getAttribute('data-type'));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !typeKeyword || typeText.indexOf(typeKeyword) !== -1 || haystack.indexOf(typeKeyword) !== -1;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedType));
      });
    }

    function sortCards() {
      if (!sortSelect || sortSelect.value === 'default') {
        apply();
        return;
      }
      containers.forEach(function (container) {
        var list = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        list.sort(function (a, b) {
          var yearA = parseInt(a.getAttribute('data-year') || '0', 10);
          var yearB = parseInt(b.getAttribute('data-year') || '0', 10);
          return sortSelect.value === 'year-asc' ? yearA - yearB : yearB - yearA;
        });
        list.forEach(function (item) {
          container.appendChild(item);
        });
      });
      apply();
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (typeInput) {
      typeInput.addEventListener('input', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    apply();
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var existing = document.querySelector('script[data-hls-library]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.setAttribute('data-hls-library', 'true');
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var message = player.querySelector('[data-player-message]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video-source');

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {
          setMessage('播放器已就绪，请再次点击视频区域开始播放。');
        });
      }

      function startPlayback() {
        if (!source) {
          setMessage('当前播放源暂不可用。');
          return;
        }
        player.classList.add('is-playing');
        setMessage('正在载入播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
          setMessage('播放源已绑定。');
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              setMessage('播放源已绑定。');
              video.play().catch(function () {
                setMessage('播放器已就绪，请再次点击视频区域开始播放。');
              });
            });
            hls.on(Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                setMessage('播放源加载遇到网络问题，可刷新页面后重试。');
              }
            });
            return;
          }
          playNative();
        }).catch(function () {
          playNative();
        });
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (video.paused && !video.src) {
          startPlayback();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
