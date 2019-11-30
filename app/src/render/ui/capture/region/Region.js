const { ipcRenderer, remote, desktopCapturer } = require('electron'),
      { BrowserWindow, screen, app } = remote,
      log = require('electron-log'),
      path = require('path'),
      url = require('url'),
      Jimp = require('jimp'),
      imageUtil = require('../../../utils/Image'),
      dirname = remote.getGlobal('dir') || '/';

import React from 'react';

import { OVERLAY } from '../../../constants/app.constants';
import { REGION_STATE } from '../../../constants/capture.constants';
import { MODE } from '../../../constants/login.constants';

let snipWindows = [],
    mainWindow = null;

class Capture extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      registered : false,
      state : REGION_STATE.SET,

      x : 0,
      y : 0,

      minX : 0,
      minY : 0
    };

    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.createSnipWindows = this.createSnipWindows.bind(this);
    this.destroySnipWindows = this.destroySnipWindows.bind(this);
    this.sendToAllSnipWindows = this.sendToAllSnipWindows.bind(this);
    this.screenshot = this.screenshot.bind(this);

    ipcRenderer.on('mouse-click', (event, args) => {
      if (this._isMounted) this.handleMouseClick(args);
    });
  }

  componentDidMount() {
    this._isMounted = true;

    mainWindow = remote.getCurrentWindow();
    mainWindow.minimize();

    this.createSnipWindows();
    ipcRenderer.send('mouse-register');
    this.setState({registered : true});
  }

  createSnipWindows() {
    let displays = screen.getAllDisplays();

    for (let i = 0; i < displays.length; i++) {
      let display = displays[i];

      let window = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.size.width,
        height: display.size.height,
        frame : false,
        closable : false,
        alwaysOnTop : true,
        skipTaskbar : true,
        transparent : true,
        fullscreen : true,
        enableLargerThanScreen : true,
        titleBarStyle : 'hidden',
        resizable : false,
        webPreferences : {
          nodeIntegration : true,
          zoomFactor : 1
        }
      });
  
      window.maximize();
      window.setFullScreen(true);
  
      if (process.env.NODE_ENV === 'development') {
        window.loadURL(url.format({
          protocol: 'http:',
          host: 'localhost:8080',
          pathname: 'region.html',
          slashes: true
        }));
      } else {
        window.loadURL(url.format({
          pathname: path.join(dirname, 'region.html'),
          protocol: 'file:',
          slashes: true
        }));
      }
  
      snipWindows.push(window);
    }
  }

  destroySnipWindows() {
    for (let i = 0; i < snipWindows.length; i++) {
      let window = snipWindows[i];
      window.destroy();
    }

    snipWindows = [];
  }

  sendToAllSnipWindows(data) {
    for (let i = 0; i < snipWindows.length; i++) {
      let window = snipWindows[i];
      window.webContents.send('snip-start', data);
    }
  }

  async handleMouseClick(event) {
    switch (this.state.state) {
      case REGION_STATE.SET:
        this.sendToAllSnipWindows({
          x : event.x,
          y : event.y
        });

        this.setState({
          state : REGION_STATE.DRAG,
          x : event.x,
          y : event.y
        });
        break;
      case REGION_STATE.DRAG:
        ipcRenderer.send('mouse-unregister');
        this.destroySnipWindows();

        try {
          let imagePath = await this.screenshot(this.state.x, this.state.y, event.x, event.y);
          await imageUtil.handleUpload(imagePath);

          //--- Refresh library
          this.props.getPageRef().current.refresh();
          
          if (this.props.getUserMode() === MODE.INSTANT) {
            this.props.setOverlay(false);
          } else {
            this.props.setOverlay(true, OVERLAY.PICTURE, { imageUrl : imagePath });
          }
        } catch (err) {
          log.error(err);
        }

        if (this.props.getUserMode() === MODE.PREVIEW) {
          mainWindow.restore();
          mainWindow.focus();
        }

        this.props.setCapture(false);
        break;
    }
  }

  screenshot(x, y, x2, y2) {
    return new Promise((resolve, reject) => {
      let key = new Date().getTime();
      let path = `${app.getPath('temp')}/${key}.png`;

      ipcRenderer.once('screenshot-response', (event, key, err) => (err ? reject() : resolve(path)));
      ipcRenderer.send('screenshot', key, Math.min(x, x2), Math.min(y, y2), Math.max(x, x2) - Math.min(x, x2), Math.max(y, y2) - Math.min(y, y2), path);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;

    ipcRenderer.send('mouse-unregister');
    this.destroySnipWindows();
  }

  render() {
    return false;
  }
};

export default Capture;