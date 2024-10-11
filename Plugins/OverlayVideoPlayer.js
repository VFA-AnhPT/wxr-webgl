const OverlayVideoPlayer = {
  video: null,
  onStop: null,

  initialize: (onStop) => {
    this.onStop = onStop;
  },

  play: (url) => {
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.src = url;
    this.video.autoplay = true;
    this.video.id = 'overlay-video-player';

    const container = document.getElementById('overlay-video-container');
    container.appendChild(this.video);
    container.style.display = "block";
  },

  stop: () => {
    this.video.remove();

    const container = document.getElementById('overlay-video-container');
    container.style.display = "none";

    this.onStop();
  },
};
