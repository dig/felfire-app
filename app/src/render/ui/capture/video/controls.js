const { ipcRenderer, remote } = require('electron');

let close = document.getElementById('close');
let play = document.getElementById('play');
let finish = document.getElementById('done');

ipcRenderer.on('images', (channel, args) => {
  let prefix = (process.env.NODE_ENV ? 'http://localhost:8080/' : '');

  close.src = `${prefix}${args.close}`;
  play.src = `${prefix}${args.play}`;
  finish.src = `${prefix}${args.tick}`;
});

function handleClose() {
  ipcRenderer.send('close');
}

function handlePlay() {

}

function handleFinish() {

}

close.onclick = handleClose;
play.onclick = handlePlay;
finish.onclick = handleFinish;