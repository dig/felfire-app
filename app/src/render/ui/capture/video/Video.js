const { ipcRenderer, remote } = require('electron'),
      { BrowserWindow, screen } = remote,
      log = require('electron-log'),
      path = require('path'),
      url = require('url'),
      imageUtil = require('../../../utils/Image'),
      dirname = remote.getGlobal('dir') || '/';

import React from 'react';

import Play from '../../../assets/img/play-control.png';
import Pause from '../../../assets/img/pause-control.png';
import Tick from '../../../assets/img/tick-control.png';
import Close from '../../../assets/img/close.png';

import { OVERLAY } from '../../../constants/app.constants';
import { VIDEO_STATE } from '../../../constants/capture.constants';
import { MODE } from '../../../constants/login.constants';

let snipWindows = [],
    controlsWindow = null,
    mainWindow = null;

class Video extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      registered : false,
      state : VIDEO_STATE.SET,

      x : 0,
      y : 0
    };

    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.createSnipWindows = this.createSnipWindows.bind(this);
    this.createControlsWindow = this.createControlsWindow.bind(this);
    this.destroySnipWindows = this.destroySnipWindows.bind(this);
    this.sendToAllSnipWindows = this.sendToAllSnipWindows.bind(this);
    this.setIgnoreMouseEvents = this.setIgnoreMouseEvents.bind(this);

    this.handleControlsClose = this.handleControlsClose.bind(this);
    this.handleControlsComplete = this.handleControlsComplete.bind(this);

    ipcRenderer.on('mouse-click', (event, args) => {
      if (this._isMounted) this.handleMouseClick(args);
    });

    ipcRenderer.on('controls-close', (event, args) => {
      if (this._isMounted) this.handleControlsClose();
    });

    ipcRenderer.on('controls-complete', (event, args) => {
      if (this._isMounted) {
        this.handleControlsComplete(args);
        this.handleControlsClose();
      }
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
          nodeIntegration : true
        }
      });
  
      window.maximize();
      window.setFullScreen(true);
  
      if (process.env.NODE_ENV === 'development') {
        window.loadURL(url.format({
          protocol: 'http:',
          host: 'localhost:8080',
          pathname: 'public/video/selection.html',
          slashes: true
        }));
      } else {
        window.loadURL(url.format({
          pathname: path.join(dirname, 'public/video/selection.html'),
          protocol: 'file:',
          slashes: true
        }));
      }
  
      snipWindows.push(window);
    }
  }

  createControlsWindow(x, y) {
    if (controlsWindow) return;

    controlsWindow = new BrowserWindow({
      x: x,
      y: y,
      width: 200,
      height: 66,
      frame : false,
      closable : false,
      alwaysOnTop : true,
      skipTaskbar : true,
      backgroundColor: '#202225',
      enableLargerThanScreen : true,
      titleBarStyle : 'hidden',
      resizable : false,
      webPreferences : {
        nodeIntegration : true
      }
    });

    controlsWindow.webContents.once('did-finish-load', () => controlsWindow.webContents.send('controls-setup', {
      parentId : remote.getCurrentWindow().webContents.id,

      pause : Pause,
      play : Play,
      tick : Tick,
      close : Close,

      region : {
        minX : Math.min(this.state.x, x),
        minY : Math.min(this.state.y, y),
        maxX : Math.max(this.state.x, x),
        maxY : Math.max(this.state.y, y)
      }
    }));

    if (process.env.NODE_ENV === 'development') {
      controlsWindow.loadURL(url.format({
        protocol: 'http:',
        host: 'localhost:8080',
        pathname: 'public/video/controls.html',
        slashes: true
      }));
    } else {
      controlsWindow.loadURL(url.format({
        pathname: path.join(dirname, 'public/video/controls.html'),
        protocol: 'file:',
        slashes: true
      }));
    }
  }

  destroySnipWindows() {
    for (let i = 0; i < snipWindows.length; i++) {
      let window = snipWindows[i];
      window.destroy();
    }

    snipWindows = [];
  }

  sendToAllSnipWindows(channel, data) {
    for (let i = 0; i < snipWindows.length; i++) {
      let window = snipWindows[i];
      window.webContents.send(channel, data);
    }
  }

  setIgnoreMouseEvents(enabled) {
    for (let i = 0; i < snipWindows.length; i++) {
      let window = snipWindows[i];
      window.setIgnoreMouseEvents(enabled);
    }
  }

  async handleMouseClick(event) {
    switch (this.state.state) {
      case VIDEO_STATE.SET:
        this.sendToAllSnipWindows('snip-start', {
          x : event.x,
          y : event.y
        });

        this.setState({
          state : VIDEO_STATE.DRAG,
          x : event.x,
          y : event.y
        });
        break;
      case VIDEO_STATE.DRAG:
        this.setIgnoreMouseEvents(true);
        this.sendToAllSnipWindows('snip-end', {
          x : event.x,
          y : event.y
        });

        this.createControlsWindow(event.x, event.y);

        this.setState({
          state : VIDEO_STATE.RECORD,
          x2 : event.x,
          y2 : event.y
        });
        break;
    }
  }

  handleControlsClose() {
    ipcRenderer.send('mouse-unregister');

    this.destroySnipWindows();
    controlsWindow.destroy();
    controlsWindow = null;

    this.props.setCapture(false);
  }

  async handleControlsComplete(output) {
    if (output == null) return;

    try {
      if (this.props.getUserMode() === MODE.INSTANT) {
        await imageUtil.handleUpload(output);
        this.props.setOverlay(false);
      } else {
        this.props.setOverlay(true, OVERLAY.PICTURE, { imageUrl : imagePath });
      }

      //--- Refresh library
      this.props.getPageRef().current.refresh();
    } catch (err) {
      log.error(err);
    }

    if (this.props.getUserMode() === MODE.PREVIEW) {
      mainWindow.restore();
      mainWindow.focus();
    }

    this.props.setCapture(false);
  }

  componentWillUnmount() {
    this._isMounted = false;
    ipcRenderer.send('mouse-unregister');

    this.destroySnipWindows();
    if (controlsWindow) controlsWindow.destroy();
    controlsWindow = null;
  }

  render() {
    return false;
  }
};

export default Video;