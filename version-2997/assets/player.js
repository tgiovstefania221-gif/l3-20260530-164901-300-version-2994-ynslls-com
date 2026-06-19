import { H as Hls } from './hls.js';

function connect(video) {
  const url = video.dataset.video;
  if (!url || video.dataset.ready === '1') return;
  video.dataset.ready = '1';
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    return;
  }
  if (Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data || !data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
    video.hlsPlayer = hls;
    return;
  }
  video.src = url;
}

function initPlayer(box) {
  const video = box.querySelector('video');
  const overlay = box.querySelector('.play-overlay');
  if (!video) return;
  const start = async () => {
    connect(video);
    if (overlay) overlay.classList.add('hidden');
    try {
      await video.play();
    } catch (_error) {
      if (overlay) overlay.classList.remove('hidden');
    }
  };
  if (overlay) overlay.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (video.paused) start();
  });
  video.addEventListener('play', () => {
    if (overlay) overlay.classList.add('hidden');
  });
  video.addEventListener('pause', () => {
    if (video.currentTime === 0 && overlay) overlay.classList.remove('hidden');
  });
  connect(video);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.player-box').forEach(initPlayer);
});
