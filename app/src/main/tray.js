const { app, Menu, Tray, shell, ipcMain } = require('electron'),
      { autoUpdater } = require('electron-updater'),
      path = require('path'),
      mainWindow = require('electron-main-window').getMainWindow(),
      iconPath = path.join(__dirname, 'icon.ico');

const itemsRequiringLogin = [
  'view-my-images',
  'capture-region',
  'capture-monitor',
  'settings'
];

const contextMenu = Menu.buildFromTemplate([
  { label: 'Website', type: 'normal', click() {
    shell.openExternal("https://felfire.app");
  } },
  { label: 'View My Images', type: 'normal', enabled: false, id: 'view-my-images' },
  { type: 'separator' },
  { label: 'Capture Region', type: 'normal', enabled: false, id: 'capture-region', click() {
    mainWindow.webContents.send('set-capture', true, 'REGION');
  } },
  { label: 'Capture Monitor', type: 'normal', enabled: false, id: 'capture-monitor', click() {
    mainWindow.webContents.send('set-overlay', true, 'MONITOR');
  } },
  { type: 'separator' },
  { label: 'Check For Updates', type: 'normal', click() {
    autoUpdater.checkForUpdates();
  } },
  { label: 'Settings', type: 'normal', enabled: false, id: 'settings' },
  { label: 'Quit', type: 'normal', role: 'quit' }
]);

let tray = null;
app.on('ready', () => {
  tray = new Tray(iconPath);

  tray.setToolTip('FelFire');
  tray.setContextMenu(contextMenu);
});

app.on('before-quit', () => tray.destroy());

ipcMain.on('login', () => {
  for (let itemId of itemsRequiringLogin) {
    for (let menuItem of contextMenu.items) {
      if (menuItem.id == itemId) {
        menuItem.enabled = true;
        tray.setContextMenu(contextMenu);
      }
    }
  }
});

ipcMain.on('logout', () => {
  for (let itemId of itemsRequiringLogin) {
    for (let menuItem of contextMenu.items) {
      if (menuItem.id == itemId) {
        menuItem.enabled = false;
        tray.setContextMenu(contextMenu);
      }
    }
  }
});