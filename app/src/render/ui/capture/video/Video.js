const { ipcRenderer, remote, desktopCapturer } = require('electron'),
      { BrowserWindow, screen } = remote,
      path = require('path'),
      url = require('url'),
      dirname = remote.getGlobal('dir') || '/';

import React from 'react';

import Play from '../../../assets/img/play-control.png';
import Tick from '../../../assets/img/tick-control.png';
import Close from '../../../assets/img/close.png';

import { VIDEO_STATE } from '../../../constants/capture.constants';

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
      y : 0,

      minX : 0,
      minY : 0
    };

    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.createSnipWindows = this.createSnipWindows.bind(this);
    this.createControlsWindow = this.createControlsWindow.bind(this);
    this.destroySnipWindows = this.destroySnipWindows.bind(this);
    this.sendToAllSnipWindows = this.sendToAllSnipWindows.bind(this);
    this.setIgnoreMouseEvents = this.setIgnoreMouseEvents.bind(this);

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

    controlsWindow.webContents.once('did-finish-load', () => controlsWindow.webContents.send('images', {
      play : Play,
      tick : Tick,
      close : Close
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
      /* case VIDEO_STATE.RECORD:
        ipcRenderer.send('mouse-unregister');

        //--- Windows
        this.destroySnipWindows();
        controlsWindow.destroy();
        controlsWindow = null;

        this.props.setCapture(false);
        break; */
    }
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