(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !overlay || !streamUrl) {
            return;
        }

        var attached = false;
        var hls = null;

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
            video.load();
        }

        function playVideo() {
            attachStream();
            overlay.classList.add("is-hidden");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    window.setTimeout(function () {
                        video.play().catch(function () {
                            overlay.classList.remove("is-hidden");
                        });
                    }, 250);
                });
            }
        }

        overlay.addEventListener("click", playVideo);
        video.addEventListener("pointerdown", attachStream);
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
