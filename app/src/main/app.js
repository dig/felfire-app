const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron'),
     { autoUpdater } = require('electron-updater'),
     log = require('electron-log'),
     storage = require('electron-json-storage');

const path = require('path'),
    url = require('url'),
    ioHook = require('iohook');

const { 
  MAIN_WINDOW_MIN_WIDTH, 
  MAIN_WINDOW_MIN_HEIGHT,
  MAIN_WINDOW_DEFAULT_WIDTH,
  MAIN_WINDOW_DEFAULT_HEIGHT
} = require('./constants/app.constants');

//--- Setup logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;
function createMainWindow(x, y, width = MAIN_WINDOW_DEFAULT_WIDTH, height = MAIN_WINDOW_DEFAULT_HEIGHT, isMaximized = false, isMinimized = false) {
  let windowOptions = {
    title: "FelFire",
    width: Math.max(width, MAIN_WINDOW_MIN_WIDTH),
    height: Math.max(height, MAIN_WINDOW_MIN_HEIGHT),
    minWidth : MAIN_WINDOW_MIN_WIDTH,
    minHeight : MAIN_WINDOW_MIN_HEIGHT,
    resizable : true,
    backgroundColor : "#202225",
    frame : false,
    show : false,
    webPreferences: {
      nodeIntegration: true
    }
  };

  if (x && y) {
    windowOptions.x = x;
    windowOptions.y = y;
  }

  mainWindow = new BrowserWindow(windowOptions);
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
    global.dir = __dirname;

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (isMaximized) mainWindow.maximize();
  if (isMinimized) mainWindow.minimize();

  mainWindow.once('ready-to-show', function() { 
    mainWindow.show(); 
    mainWindow.focus(); 
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function fetchWindowSettings() {
  return new Promise((resolve, reject) => {
    storage.get('settings', function(error, data) {
      if (error) reject();
      resolve(data);
    });
  });
}

function saveWindowSettings() {
  return new Promise((resolve, reject) => {
    let options = {
      x : mainWindow.getPosition()[0],
      y : mainWindow.getPosition()[1],
      width : Math.max(mainWindow.getSize()[0], MAIN_WINDOW_MIN_WIDTH),
      height : Math.max(mainWindow.getSize()[1], MAIN_WINDOW_MIN_HEIGHT),
      isMaximized : mainWindow.isMaximized(),
      isMinimized : mainWindow.isMinimized()
    };

    storage.set('settings', options, function(error) {
      if (error) reject();
      resolve();
    });
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


app.on('ready', async () => {
  try {
    let windowSettings = await fetchWindowSettings();
    createMainWindow(
      windowSettings.x, 
      windowSettings.y, 
      windowSettings.width, 
      windowSettings.height, 
      windowSettings.isMaximized, 
      windowSettings.isMinimized
    );
  } catch (err) {
    createMainWindow();
  }
});
app.on('window-all-closed', async () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    try {
      let windowSettings = await fetchWindowSettings();
      createMainWindow(
        windowSettings.x, 
        windowSettings.y, 
        windowSettings.width, 
        windowSettings.height, 
        windowSettings.isMaximized, 
        windowSettings.isMinimized
      );
    } catch (err) {
      createMainWindow();
    }
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
ipcMain.on('toolbar-close', async () => {
  await saveWindowSettings();
  mainWindow.hide();
});

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

//--- Mouse events registering
let powerSaveID;
ipcMain.on('mouse-register', () => {
  powerSaveID = powerSaveBlocker.start('prevent-app-suspension');
  ioHook.start();
});
ipcMain.on('mouse-unregister', () => {
  powerSaveBlocker.stop(powerSaveID);
  ioHook.stop();
});
ioHook.on('mousedown', event => mainWindow.webContents.send('mouse-click', event));
// ioHook.on('mousemove', event => mainWindow.webContents.send('mouse-move', event));