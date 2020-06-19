const { ipcRenderer, remote } = require('electron'),
      { app } = remote,
      windowId = remote.getCurrentWebContents().id;

const progress = document.getElementById('progress'),
      close = document.getElementById('close'),
      play = document.getElementById('play'),
      finish = document.getElementById('done');

const STATE = {
  INITIAL: 'INITIAL',
  RECORDING: 'RECORDING',
  PAUSED: 'PAUSED',
  RENDER: 'RENDER'
};

let loaded = false,
    playSrc = '',
    pauseSrc = '',
    region = null,
    path = null,
    output = null;

let state = {
  parentWindowId : -1,
  recordId : null,
  state : STATE.INITIAL,

  timeInMillis : 0
};

ipcRenderer.on('controls-setup', (channel, args) => {
  let prefix = (process.env.NODE_ENV ? 'http://localhost:8080/' : '../../');

  region = args.region;
  state.parentWindowId = args.parentId;
  
  playSrc = `${prefix}${args.play}`;
  pauseSrc = `${prefix}${args.pause}`;

  close.src = `${prefix}${args.close}`;
  play.src = `${prefix}${args.play}`;
  finish.src = `${prefix}${args.tick}`;

  loaded = true;
});

ipcRenderer.on('record-response', (channel, key, error) => {
  if (error) {
    setState(STATE.INITIAL);
  } else {
    handleFinish();
  }
});

ipcRenderer.on('record-render-response', (channel, key, error) => {
  if (error) {
    setState(STATE.INITIAL);
  } else {
    ipcRenderer.sendTo(state.parentWindowId, 'controls-complete', output);
  }
});

function setState(to) {
  switch (to) {
    case STATE.INITIAL:
      ipcRenderer.send('record-kill', state.recordId)
      state.recordId = null;
      play.src = playSrc;
      break;
    case STATE.RECORDING:
      if (state.state === STATE.PAUSED) {
        ipcRenderer.send('record-resume', state.recordId);
        play.src = pauseSrc;
      } else {
        let key = new Date().getTime();
        path = `${app.getPath('temp')}/${key}.avi`;
        output = `${app.getPath('temp')}/${key}.mp4`;

        state.recordId = key;
        ipcRenderer.send('record-start', state.recordId, region.minX, region.minY, region.maxX - region.minX, region.maxY - region.minY, path, '0:20', windowId);
        
        finish.parentNode.classList.remove('disabled');
        play.src = pauseSrc;
      }
      break;
    case STATE.PAUSED:
      ipcRenderer.send('record-pause', state.recordId);
      play.src = playSrc;
      break;
    case STATE.RENDER:
      if (state.state === STATE.INITIAL) return;
      ipcRenderer.send('record-render', path, output, windowId);
      break;  
  }

  state.state = to;
}

function handleClose() {
  if (!loaded) return;
  
  if (state.recordId != null) ipcRenderer.send('record-kill', state.recordId);
  ipcRenderer.sendTo(state.parentWindowId, 'controls-close');
}

function handlePlay() {
  if (!loaded) return;

  if (state.state === STATE.RECORDING) {
    // setState(STATE.PAUSED);
  } else {
    setState(STATE.RECORDING);
  }
}

function handleFinish() {
  if (!loaded || state === STATE.INITIAL) return;
  ipcRenderer.send('record-kill', state.recordId);
  setState(STATE.RENDER);
}

function handleProgress() {
  if (state.state === STATE.RECORDING) {
    state.timeInMillis += 50;

    progress.style.background = '#c7493a';
  } else if (state.state === STATE.RENDER) {
    if (state.timeInMillis >= (20 * 1000)) {
      state.timeInMillis = 0;
    } else {
      state.timeInMillis += 500;
    }

    progress.style.background = '#77dd77';
  }

  progress.style.width = `${(state.timeInMillis / (20 * 1000)) * 100}%`;
}

close.parentNode.onclick = handleClose;
play.parentNode.onclick = handlePlay;
finish.parentNode.onclick = handleFinish;

setInterval(() => handleProgress(), 50);