import '../styles/main.css';
import Fns from "./_helpers.js";
import songQueue from '../../src/json/playlist.json' assert { type: "json" };

document.addEventListener('DOMContentLoaded', async () => {

  let queueIndex = 0;
  let songQueueShuffled = [];
  // const songQueue = await Fns.getPlayList();
  
  // load songs
  Fns.loadQueue(songQueue);
  Fns.loadPlaying(songQueue[queueIndex]);
  Fns.queuePlaying();

  // TIME UPDATE WHILE PLAYING //
  document.querySelector('#nowPlaying').addEventListener('timeupdate', Fns.timeUpdate);


  // TIME UPDATE ON INPUT //
  document.querySelector('#nowPlayingProgressBar').addEventListener('input', event => {
    // temporary remove timeupdate event. 
    // without doing so, the input range thumb will not move acourdingly when user move the thumb while playing
    document.querySelector('#nowPlaying').removeEventListener('timeupdate', Fns.timeUpdate);

    const progressBar = event.currentTarget;
    // set --progress-track value, we don't need to worry about the track thumb
    progressBar.style.setProperty('--progress-track', `${progressBar.value / progressBar.getAttribute('max') * 100}%`);
    // update current duration element
    document.querySelector('#nowPlayingCurrentDuration').textContent = Fns.toTime(progressBar.value);

    // event triggers on mouse release
    progressBar.addEventListener('change', ev => {
      // update audio now playing currentTime
      document.querySelector('#nowPlaying').currentTime = ev.currentTarget.value;
      // re-add timeupdate event
      document.querySelector('#nowPlaying').addEventListener('timeupdate', Fns.timeUpdate);
    });
  });


  // SONG ENDED EVENT //
  document.querySelector('#nowPlaying').addEventListener('ended', event => {
    const songOrder = document.querySelector('#controlRepeat').dataset.songOrder;
    
    if (songOrder === 'repeat_one') {
      // reset audio nowPlaying current time
      event.currentTarget.currentTime = 0;
    } else {
      // "repeat" and "shuffle" does the same thing, play the next queue song...
      queueIndex = (queueIndex >= songQueue.length - 1) ? 0 : queueIndex + 1;
      // ...the only difference is which songQueue to use
      Fns.loadPlaying(songOrder === 'shuffle' ? songQueueShuffled[queueIndex] : songQueue[queueIndex]); // load new song
      Fns.queuePlaying(); // update queue playing
    }

    // play song either ways
    event.currentTarget.play();
  });


  // SONG SELECT ON QUEUE //
  document.querySelector('ul#queueList').addEventListener('click', event => {
    const targetId = event.target.closest('li').querySelector('audio').getAttribute('src');
    const isShuffled = document.querySelector('#controlRepeat').dataset.songOrder === 'shuffle';
    const targetIndex = (isShuffled ? songQueueShuffled : songQueue).findIndex(i => i.audio === targetId);
    
    Array.from((isShuffled) ? songQueueShuffled : songQueue)
      .forEach(song => {
        if (targetId === song.audio) {
          Fns.loadPlaying(isShuffled ? songQueueShuffled[targetIndex] : songQueue[targetIndex]);
          Fns.queuePlaying();
        }
      });
    
    // play new song if playing
    if (document.querySelector('#controlPlayPause').dataset.icon === 'pause') {
      document.querySelector('#nowPlaying').play();
    } else {
      document.querySelector('#nowPlaying').pause();
    }
    
    // close queue list
    document.querySelector('.player-queuelist').classList.remove('active');
  });

  /////////// PLAYER CONTROLS ///////////
  // toggle song queue
  document.querySelector('#controlShowQueue').addEventListener('click', Fns.toggleQueue);
  document.querySelector('#controlCloseQueue').addEventListener('click', Fns.toggleQueue);

  // play/pause | next/prev | repeat/shuffle
  document.querySelector('.player-controller').addEventListener('click', event => {
    const target = event.target;
    const nowPlaying = document.querySelector('#nowPlaying');
    const isPlaying = document.querySelector('#controlPlayPause').dataset.icon === 'pause'; // if the icon is "pause" the audio is playing
    const isShuffled = document.querySelector('#controlRepeat').dataset.songOrder === 'shuffle';

    switch (target.id) {
      case 'controlPlayPause':      // Play/Pause Button
        if (isPlaying) {
          nowPlaying.pause();
          target.dataset.icon = 'play_arrow';
        } else {
          nowPlaying.play();
          target.dataset.icon = 'pause';
        }
        break;
      case 'controlPrev':           // Previous Button
      case 'controlNext':           // Next Button
        // update queue index
        queueIndex = (target.id === 'controlNext')
                      ? (queueIndex >= songQueue.length - 1) ? 0 : queueIndex + 1
                      : (queueIndex <= 0) ? songQueue.length - 1 : queueIndex - 1;
        Fns.loadPlaying(isShuffled ? songQueueShuffled[queueIndex] : songQueue[queueIndex]);
        Fns.queuePlaying();

        // auto play next/prev song if clicked while playing
        if (isPlaying) nowPlaying.play();
        break;
      case 'controlRepeat':         // repeat|repeat one|shuffle song order
        switch (target.dataset.songOrder) {
          case 'repeat':
            // change icon and song order
            target.dataset.songOrder = 'repeat_one';
            target.textContent = 'repeat_one';
            break;
          case 'repeat_one':
            // change icon and song order
            target.dataset.songOrder = 'shuffle';
            target.textContent = 'shuffle';

            // shuffle song list
            // we're using spread (...) so we dont alter the songQueue array
            const _songQueue = [...songQueue];
            const _nowPlaying = _songQueue.splice(queueIndex, 1);
            songQueueShuffled = [_nowPlaying[0], ..._songQueue.sort(() => Math.random() - 0.5)];

            queueIndex = 0; // reset the queueIndex

            // load shuffle songs
            Fns.loadQueue(songQueueShuffled);
            // update queue playing
            Fns.queuePlaying();
            break;
          case 'shuffle':
            // change icon and song order
            target.dataset.songOrder = 'repeat';
            target.textContent = 'repeat';

            // use audio source/link as ID to find the now playing song index inside the songList
            queueIndex = songQueue.findIndex(i => i.audio === nowPlaying.getAttribute('src'));

            // load unshuffle songs
            Fns.loadQueue(songQueue);
            // update queue playing
            Fns.queuePlaying();
            break;
        };
        break;
    };
  });
});