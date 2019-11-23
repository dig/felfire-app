const { app, Menu, Tray, shell } = require('electron'),
      { autoUpdater } = require('electron-updater'),
      path = require('path'),
      iconPath = path.join(__dirname, 'icon.ico');

let tray = null;
app.on('ready', () => {
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Website', type: 'normal', click() {
      shell.openExternal("https://felfire.app");
    } },
    { label: 'View My Images', type: 'normal', enabled: false },
    { type: 'separator' },
    { label: 'Capture Region', type: 'normal', enabled: false },
    { label: 'Capture Monitor', type: 'normal', enabled: false },
    { type: 'separator' },
    { label: 'Check For Updates', type: 'normal', click() {
      autoUpdater.checkForUpdates();
    } },
    { label: 'Settings', type: 'normal', enabled: false },
    { label: 'Quit', type: 'normal', role: 'quit' }
  ]);

  tray.setToolTip('FelFire');
  tray.setContextMenu(contextMenu);
});