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

function handleCursorUpdate() {
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
    let x = anchorX;
    let y = anchorY;

    let width = cursorPos.x - anchorX;
    let height = cursorPos.y - anchorY;

    if (!anchorOnDisplay) {
      switch (true) {
        //--- Left
        case (anchorX <= cursorPos.x && (anchorY >= displayPos.y && (anchorY <= (displayPos.y + displayPos.height)))): 
          x = 0; 
          width = (cursorPos.x - (displayPos.width * Math.floor(cursorPos.x / displayPos.width)));
          break;
        //--- Right
        case (anchorX >= cursorPos.x && (anchorY >= displayPos.y && (anchorY <= (displayPos.y + displayPos.height)))): 
          x = displayPos.width; 
          width = (cursorPos.x - (displayPos.width * Math.floor(cursorPos.x / displayPos.width)));
          break;
        //--- Top
        case (anchorY <= cursorPos.y && (anchorX >= displayPos.x && (anchorX <= (displayPos.x + displayPos.width)))): 
          y = 0; 
          height = (cursorPos.y - (displayPos.height * Math.floor(cursorPos.y / displayPos.height)));
          break;
        //--- Bottom
        case (anchorY >= cursorPos.y && (anchorX >= displayPos.x && (anchorX <= (displayPos.x + displayPos.width)))): 
          y = displayPos.height; 
          height = (cursorPos.y - (displayPos.height * Math.floor(cursorPos.y / displayPos.height)));
          break;
      }
    }
  
    if (cursorPos.y < anchorY) {
      y = cursorPos.y;
      height = anchorY - cursorPos.y;
    }
  
    if (cursorPos.x < anchorX) {
      x = cursorPos.x;
      width = anchorX - cursorPos.x;
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

setInterval(() => handleCursorUpdate(), 10);