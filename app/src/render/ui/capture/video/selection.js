const { ipcRenderer, remote } = require('electron');
const display = remote.getCurrentWindow(),
      displayPos = display.getBounds();

let enabled = false;

let anchorX = 0;
let anchorY = 0;
let anchorOnDisplay = false;

let finalX = 0;
let finalY = 0;
let finalOnDisplay = false;

let html = document.getElementsByTagName('html');
let selection = document.getElementById('selection');
let controls = document.getElementById('controls');

ipcRenderer.on('snip-start', (event, args) => {
  enabled = true;
  anchorX = args.x;
  anchorY = args.y;

  let displayPos = display.getBounds();
  if (anchorX >= displayPos.x && anchorX <= (displayPos.x + displayPos.width)
    && (anchorY >= displayPos.y && anchorY <= (displayPos.y + displayPos.height))) {
      anchorOnDisplay = true;
  }
});

ipcRenderer.on('snip-end', (event, args) => {
  enabled = false;
  finalX = args.x;
  finalY = args.y;

  html[0].classList.remove('crosshair');
  selection.classList.add('outline');

  if (finalX >= displayPos.x && finalX <= (displayPos.x + displayPos.width)
    && (finalY >= displayPos.y && finalY <= (displayPos.y + displayPos.height))) {
      finalOnDisplay = true;
  }

  if (finalOnDisplay) {
    let x = finalX - displayPos.x;
    let y = finalY - displayPos.y;

    controls.style.display = 'block';
    controls.style.left = `${x}px`;
    controls.style.top = `${y}px`;
  }
});

function tick() {
  if (!enabled) return;
  let cursorPos = remote.screen.getCursorScreenPoint();

  let cursorOnDisplay = false;
  if (cursorPos.x >= displayPos.x && cursorPos.x <= (displayPos.x + displayPos.width)
    && (cursorPos.y >= displayPos.y && cursorPos.y <= (displayPos.y + displayPos.height))) {
      cursorOnDisplay = true;
  }

  if (anchorOnDisplay || cursorOnDisplay) {
    let localAnchorX = anchorX - displayPos.x;
    let localAnchorY = anchorY - displayPos.y;

    let localCursorX = cursorPos.x - displayPos.x;
    let localCursorY = cursorPos.y - displayPos.y;

    let x = localAnchorX;
    let y = localAnchorY;

    let width = localCursorX - localAnchorX;
    let height = localCursorY - localAnchorY;

    if (localCursorX < localAnchorX) {
      x = localCursorX;
      width = localAnchorX - localCursorX;
    }

    if (localCursorY < localAnchorY) {
      y = localCursorY;
      height = localAnchorY - localCursorY;
    }

    if (!anchorOnDisplay && cursorOnDisplay) {
      switch (true) {
        //--- Left
        case (anchorX <= cursorPos.x && (anchorY >= displayPos.y && (anchorY <= (displayPos.y + displayPos.height)))): 
          x = 0; 
          width = localCursorX;
          break;
        //--- Right
        case (anchorX >= cursorPos.x && (anchorY >= displayPos.y && (anchorY <= (displayPos.y + displayPos.height)))): 
          x = localCursorX; 
          width = displayPos.width - localCursorX;
          break;
        //--- Top
        case (anchorY <= cursorPos.y && (anchorX >= displayPos.x && (anchorX <= (displayPos.x + displayPos.width)))): 
          y = 0;
          height = localCursorY;
          break;
        //--- Bottom
        case (anchorY >= cursorPos.y && (anchorX >= displayPos.x && (anchorX <= (displayPos.x + displayPos.width)))): 
          y = localCursorY;
          height = displayPos.height - localCursorY;
          break;
      }
    }

    //--- Positioning
    selection.style.display = 'block';
    selection.style.left = `${x}px`;
    selection.style.top = `${y}px`;
    selection.style.width = `${width}px`;
    selection.style.height = `${height}px`;
  } else {
    selection.style.display = 'none';
  }
}

setInterval(() => tick(), 1);