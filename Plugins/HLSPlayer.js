const HLSPlayer = {
  video: null,
  frameBufferContext: null,
  playing: false,

  initialize: function () {
    this.video = document.createElement('video');
    // Display on the top-left corner
    // Comment out the z-index line to watch the video element directly (for debugging)
    this.video.style.width = '192px';
    this.video.style.height = '108px';
    this.video.style.position = 'absolute';
    this.video.style.zIndex = '-9999';
    document.body.appendChild(this.video);
    // Can't play video when display is none
    //this.video.style.display = 'none';

    // Required for iOS Safari
    this.video.setAttribute('playsinline', '');
    this.video.autoplay = true;
    // Required for Cloudflare Stream
    this.video.setAttribute("crossorigin", "anonymous");

    const canvas = document.createElement('canvas');
    canvas.id = 'frame_buffer';
    canvas.width = 512;
    canvas.height = 512;
    this.frameBufferContext = canvas.getContext('2d', { willReadFrequently: true });
  },

  play: function (url, muted) {
    if (this.playing) return;

    if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari can play HLS natively
      this.video.src = url;
      this.video.muted = muted;
      this.video.play();
    } else if (Hls.isSupported()) {
      // Use hls.js
      var hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(this.video);
    }

    this.playing = true;
    this.video.requestVideoFrameCallback((now, metadata) => { this.updateFrame(now, metadata) });
  },

  stop: function () {
    this.video.pause();
    this.playing = false;
  },

  mute: function () {
    if (!this.playing) return;
    this.video.muted = true;
  },

  unmute: function () {
    if (!this.playing) return;
    this.video.muted = false;
  },

  updateFrame: function (now, metadata) {
    if (!this.playing) return;

    // Capture the video frame and update the Unity texture
    this.frameBufferContext.drawImage(this.video, 0, 0, 512, 512);
    window.hlsPlayerPluginImageData = this.frameBufferContext.getImageData(0, 0, 512, 512);
    unityInstance.SendMessage('HLSPlayer', 'UpdateTexture');

    this.video.requestVideoFrameCallback((now, metadata) => { this.updateFrame(now, metadata) });
  }
};
