const { app, BrowserWindow, ipcMain } = require('electron'),
     { autoUpdater } = require('electron-updater'),
     log = require('electron-log');

const path = require('path'),
    url = require('url');

//--- Setup logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "FelFire",
    height: 700,
    width: 1200,
    minHeight : 600,
    minWidth : 1000,
    resizable : true,
    backgroundColor : "#202225",
    frame : false,
    show : false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.setMenu(null);

  if (process.env.NODE_ENV === 'development') {
    global.apiURL = 'https://localhost:3235';
    mainWindow.loadURL(url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    }));

    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS
    } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));

    mainWindow.webContents.openDevTools();
  } else {
    global.apiURL = 'https://api.felfire.app';
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  mainWindow.once('ready-to-show', function() { 
    mainWindow.show(); 
    mainWindow.focus(); 
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

//--- Single instance application
const appLock = app.requestSingleInstanceLock();
if (!appLock) {
  app.quit();
  return;
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      mainWindow.show();

      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}


app.on('ready', createMainWindow);
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

//--- Toolbar
ipcMain.on('toolbar-minimize', () => mainWindow.minimize());
ipcMain.on('toolbar-maximize', () => {
  if (!mainWindow.isMaximized()) {
    mainWindow.maximize();
  } else {
    mainWindow.setSize(1200, 700, true);
    mainWindow.center();
  }
});
ipcMain.on('toolbar-close', () => mainWindow.hide());

//--- Auto updates
autoUpdater.autoDownload = false;
autoUpdater.on('checking-for-update', () => mainWindow.webContents.send('checking-for-update'));
autoUpdater.on('update-available', () => mainWindow.webContents.send('update-available'));
autoUpdater.on('update-not-available', () => mainWindow.webContents.send('update-not-available'));
autoUpdater.on('error', (error) => {
  log.error(error);
  mainWindow.webContents.send('update-error');
});
autoUpdater.on('download-progress', (progressObj) => mainWindow.webContents.send('update-progress', progressObj.percent));
autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall(true, true));
ipcMain.on('update-check', () => {
  autoUpdater.checkForUpdates();
  setInterval(() => autoUpdater.checkForUpdates(), 1800 * 1000); //--- Every 30mins
});
ipcMain.on('update-install', () => autoUpdater.downloadUpdate());