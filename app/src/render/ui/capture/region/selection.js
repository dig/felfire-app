const { ipcRenderer, remote } = require('electron');
const display = remote.getCurrentWindow();

let enabled = false;

let anchorX = 0;
let anchorY = 0;
let anchorOnDisplay = false;

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

function tick() {
  if (!enabled) return;

  let displayPos = display.getBounds();
  let cursorPos = remote.screen.getCursorScreenPoint();

  let cursorOnDisplay = false;
  if (cursorPos.x >= displayPos.x && cursorPos.x <= (displayPos.x + displayPos.width)
    && (cursorPos.y >= displayPos.y && cursorPos.y <= (displayPos.y + displayPos.height))) {
      cursorOnDisplay = true;
  }

  let element = document.getElementById('selection');
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
    element.style.display = 'block';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  } else {
    element.style.display = 'none';
  }
}

setInterval(() => tick(), 1);