const audio = document.createElement('audio');

const MusicPlayer = {
  load: (url) => {
    if (audio.canPlayType('audio/ogg')) {
      audio.setAttribute('src', url + '.ogg');
      console.log('Format: Ogg Vorbis');
    } else if (audio.canPlayType('audio/mp3')) {
      audio.setAttribute('src', url + '.mp3');
      console.log('Format: MP3');
    }
  },
  play: (isLoop) => {
    if (!audio.paused) return;
    if (!audio.url) return;

    audio.loop = isLoop;
    audio.play();
  },
  stop: () => {
    audio.pause();
  },
  setVolume: (volume) => {
    audio.volume = volume;
  }
};
