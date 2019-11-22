const { remote } = require('electron');
const display = remote.getCurrentWindow();

const anchorX = display.getPosition()[0];
const anchorY = display.getPosition()[1];

this.updateID = setInterval(() => {
  let cursorPos = remote.screen.getCursorScreenPoint();

  let x = anchorX;
  let y = anchorY;

  let width = cursorPos.x - anchorX;
  let height = cursorPos.y - anchorY;

  if (cursorPos.y < anchorY) {
    y = cursorPos.y;
    height = (anchorY - cursorPos.y) + 10;
  }

  if (cursorPos.x < anchorX) {
    x = cursorPos.x;
    width = (anchorX - cursorPos.x) + 10;
  }

  display.setBounds({
    x : x,
    y : y,
    width : width,
    height : height
  });
}, 10);