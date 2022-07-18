export default class Fns {
  // static async getPlayList() {
  //   const response = await fetch('./assets/playlist/playlist.json');
  //   const data = await response.json();
  //   return data;
  // }
  static loadQueue(queue) {
    const queueList = document.querySelector('ul#queueList');

    if (queue.length === 0) return; // queue must have atleast one song
    queueList.innerHTML = ''; // remove all elements inside qContainer

    // create <li> for every queue item
    queue.forEach(song => {
      const queueItem = document.createElement('li');
      queueItem.innerHTML = `
        <img src="${song.img}" />
        <div>
          <p>${song.title}</p>
          <p>${song.artist}</p>
        </div>
        <p class="song-duration">n/a</p>
        <audio src="${song.audio}" preload="metadata"></audio>
      `;
      // append to queueList
      queueList.append(queueItem);

      // queueItem song-duration
      queueItem.querySelector('audio').addEventListener('loadedmetadata', ev => {
        queueItem.querySelector('p.song-duration').textContent = Fns.toTime(ev.currentTarget.duration);
      });
    });
  }

  static loadPlaying(song) {
    // set song sources
    const nowPlaying = document.querySelector('audio#nowPlaying');
    nowPlaying.src = song.audio;
    nowPlaying.addEventListener('loadedmetadata', ev => {
      // song total duration
      document.querySelector('#nowPlayingTotalDuration').textContent = Fns.toTime(ev.currentTarget.duration);
      // progressbar max value
      document.querySelector('#nowPlayingProgressBar').setAttribute('max', ev.currentTarget.duration);
    });
    document.querySelector('#nowPlayingCover > img').src = song.img;        // song cover
    document.querySelector('#nowPlayingTitle').textContent = song.title;    // song title
    document.querySelector('#nowPlayingArtist').textContent = song.artist;  // song artist
  }

  static queuePlaying() {
    const playingId = document.querySelector('#nowPlaying').getAttribute('src');
    Array.from(document.querySelectorAll('ul#queueList > li')).forEach(li => {
      const liId = li.querySelector('audio').getAttribute('src');
      (playingId === liId) ? li.classList.add('playing') : li.classList.remove('playing');
    });
  }

  static timeUpdate(event) {
    const progBar = document.querySelector('#nowPlayingProgressBar');
    progBar.value = event.currentTarget.currentTime;
    progBar.style.setProperty('--progress-track', `${progBar.value / progBar.getAttribute('max') * 100}%`);
    document.querySelector('#nowPlayingCurrentDuration').textContent = Fns.toTime(progBar.value);
  } 

  static shuffleQueue() {}
  static toggleQueue(event) {
    if (event.currentTarget.id === 'controlShowQueue') {
      document.querySelector('.player-queuelist').classList.add('active');
    } else if (event.currentTarget.id === 'controlCloseQueue') {
      document.querySelector('.player-queuelist').classList.remove('active');
    }
  }

  static toTime(dur) {
    const min = Math.floor(dur / 60);
    const sec = Math.floor(dur % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
}