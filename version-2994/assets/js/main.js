(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function textOf(value) {
        return String(value || "").toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var previous = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("active", position === index);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("active", position === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (previous) {
                previous.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot, position) {
                dot.addEventListener("click", function () {
                    show(position);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scopeSelector = panel.getAttribute("data-filter-panel") || "body";
            var scope = document.querySelector(scopeSelector) || document;
            var input = panel.querySelector("[data-movie-search]");
            var region = panel.querySelector("[data-region-filter]");
            var year = panel.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-item"));
            var empty = document.querySelector("[data-empty-state]");

            function apply() {
                var query = textOf(input && input.value).trim();
                var regionValue = textOf(region && region.value).trim();
                var yearValue = textOf(year && year.value).trim();
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = textOf([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !regionValue || textOf(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
                    var matchesYear = !yearValue || textOf(card.getAttribute("data-year")) === yearValue;
                    var showCard = matchesQuery && matchesRegion && matchesYear;
                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("active", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }

            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (initialQuery && input) {
                input.value = initialQuery;
            }
            apply();
        });
    });
})();
