const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

const path = require('path');
const fs = require('fs');
const url = require('url');
const request = require('request');

class Config {
  constructor(opts) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.path = path.join(userDataPath, opts.name + '.json');
    this.data = parseDataFile(this.path, {}) || {};
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    return defaults;
  }
}

let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "FelFire",
    height: 700,
    width: 1200,
    resizable : false,
    backgroundColor : "#202225",
    frame : false,
    show : false
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.env.NODE_ENV === 'development') {
    const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
        REDUX_DEVTOOLS,
    } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS)
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err));

    installExtension(REDUX_DEVTOOLS)
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err));

    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', function() { 
    mainWindow.show(); 
    mainWindow.focus(); 
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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


const userConfig = new Config({name: 'user'});
function load() {
  //--- If key doesn't exist
  let key = userConfig.get('key');
  if (key == null) {
    mainWindow.webContents.send('load-setup', true);
    setTimeout(() => mainWindow.webContents.send('change-page', "LOGIN"), 6000);
    // mainWindow.webContents.send('change-page', "LOGIN")
    return;
  }

  mainWindow.webContents.send('load-state', 0.3);


}

function login(userName, password) {
  mainWindow.webContents.send('login-response', 0);
}

ipc.on('load-init', load);
ipc.on('login-request', (userName, password) => login(userName, password));

ipc.on('toolbar-minimize', () => mainWindow.minimize());
ipc.on('toolbar-maximize', () => {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  if (mainWindow.getSize()[0] < width || mainWindow.getSize()[1] < height) {
    mainWindow.maximize();
  } else {
    mainWindow.setSize(1200, 700, true);
    mainWindow.center();
  }
});
ipc.on('toolbar-close', () => mainWindow.hide());