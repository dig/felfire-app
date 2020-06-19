const { ipcMain } = require('electron'),
      { autoUpdater } = require('electron-updater'),
      log = require('electron-log'),
      main = require('./app');

//--- Setup
autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => main.send('checking-for-update'));
autoUpdater.on('update-available', () => main.send('update-available'));
autoUpdater.on('update-not-available', () => main.send('update-not-available'));
autoUpdater.on('download-progress', (progressObj) => main.send('update-progress', progressObj.percent));
autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall(true, true));
autoUpdater.on('error', (error) => {
  log.error(error);
  main.send('update-error');
});

//--- Every 30mins, checkForUpdates()
ipcMain.on('update-check', () => {
  autoUpdater.checkForUpdates();
  setInterval(() => autoUpdater.checkForUpdates(), 1800 * 1000);
});

ipcMain.on('update-install', () => autoUpdater.downloadUpdate());