const { ipcMain, powerSaveBlocker } = require('electron'),
      ioHook = require('iohook'),
      main = require('./app');

let powerSaveID;
ipcMain.on('mouse-register', () => {
  powerSaveID = powerSaveBlocker.start('prevent-app-suspension');
  ioHook.start();
});

ipcMain.on('mouse-unregister', () => {
  powerSaveBlocker.stop(powerSaveID);
  ioHook.stop();
});

ioHook.on('mousedown', event => main.send('mouse-click', event));