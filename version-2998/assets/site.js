(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector(".filter-input");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var activeValue = "";

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visibleCount = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var cardFilter = card.getAttribute("data-filter") || "";
          var matchText = !query || text.indexOf(query) !== -1;
          var matchChip = !activeValue || cardFilter.indexOf(activeValue) !== -1 || text.indexOf(activeValue.toLowerCase()) !== -1;
          var visible = matchText && matchChip;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("visible", visibleCount === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          activeValue = chip.getAttribute("data-filter-value") || "";
          applyFilter();
        });
      });
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }

    var shell = video.closest(".player-shell");
    var message = shell ? shell.querySelector(".player-message") : null;
    var overlay = button;
    var started = false;
    var hls = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachSource() {
      if (started) {
        return;
      }
      started = true;
      showMessage("");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage("播放失败，请稍后重试");
          }
        });
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      attachSource();
      overlay.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("error", function () {
      showMessage("播放失败，请稍后重试");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileNav();
    initFilters();
  });
})();
