const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

const path = require('path'),
    url = require('url');

let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "FelFire",
    height: 700,
    width: 1200,
    minHeight : 400,
    minWidth : 900,
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
    global.apiURL = 'https://localhost:3000';
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
ipc.on('toolbar-minimize', () => mainWindow.minimize());
ipc.on('toolbar-maximize', () => {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  if (!mainWindow.isMaximized()) {
    mainWindow.maximize();
  } else {
    mainWindow.setSize(1200, 700, true);
    mainWindow.center();
  }
});
ipc.on('toolbar-close', () => mainWindow.hide());