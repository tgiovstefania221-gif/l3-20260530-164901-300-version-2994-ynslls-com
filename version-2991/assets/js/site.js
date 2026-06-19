(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        const button = document.querySelector(".menu-toggle");
        const panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            const expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        const slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll(".hero-slide"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        let index = 0;
        let timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        function start() {
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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        const inputs = Array.from(document.querySelectorAll("[data-filter-input]"));
        if (!inputs.length) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        inputs.forEach(function (input) {
            const targetSelector = input.getAttribute("data-filter-target") || ".movie-grid";
            const target = document.querySelector(targetSelector);
            const cards = target ? Array.from(target.querySelectorAll(".movie-card")) : [];
            const emptyState = document.querySelector("[data-empty-state]");
            function apply() {
                const query = normalize(input.value);
                let visible = 0;
                cards.forEach(function (card) {
                    const text = normalize(card.getAttribute("data-filter-text"));
                    const matched = !query || text.indexOf(query) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    function setupPlayers() {
        const players = Array.from(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            const video = player.querySelector("video");
            const source = video ? video.querySelector("source") : null;
            const overlay = player.querySelector(".play-overlay");
            if (!video || !source) {
                return;
            }
            const stream = source.getAttribute("src");
            let attached = false;
            function attach() {
                if (attached || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    attached = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    attached = true;
                    return;
                }
                video.src = stream;
                attached = true;
            }
            function play() {
                attach();
                video.controls = true;
                player.classList.add("is-playing");
                const promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    player.classList.remove("is-playing");
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
