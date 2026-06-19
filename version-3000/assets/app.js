(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  });
})();

function initHeroCarousel() {
  var root = document.querySelector("[data-hero-slider]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupCardFilter(inputId, itemSelector, readQuery) {
  var input = document.getElementById(inputId);
  var items = Array.prototype.slice.call(document.querySelectorAll(itemSelector));
  if (!input || !items.length) {
    return;
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(input.value);
    items.forEach(function (item) {
      var haystack = normalize(item.getAttribute("data-keywords") || item.textContent);
      item.classList.toggle("is-hidden", keyword !== "" && haystack.indexOf(keyword) === -1);
    });
  }

  if (readQuery) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      input.value = q;
    }
  }

  input.addEventListener("input", applyFilter);
  applyFilter();
}

function setupMoviePlayer(source) {
  document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    var hls = null;
    var started = false;

    if (!video || !overlay || !source) {
      return;
    }

    function hideOverlay() {
      overlay.classList.add("hidden");
    }

    function loadAndPlay() {
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
        }
      }
      hideOverlay();
      video.play().catch(function () {});
    }

    overlay.addEventListener("click", loadAndPlay);
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener("play", hideOverlay);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
