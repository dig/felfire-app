const { ipcRenderer, remote } = require('electron'),
      { BrowserWindow, screen } = remote,
      path = require('path'),
      url = require('url'),
      dirname = remote.getGlobal('dir') || '/';

import React from 'react';
import { REGION_STATE } from '../../constants/capture.constants';

let snipWindow = null,
    mainWindow = null;

class Capture extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      registered : false,
      state : REGION_STATE.SET,

      x : 0,
      y : 0
    };

    this.handleMouseClick = this.handleMouseClick.bind(this);

    ipcRenderer.on('mouse-click', (event, args) => {
      if (this._isMounted) this.handleMouseClick(args);
    });
  }

  componentDidMount() {
    this._isMounted = true;

    mainWindow = remote.getCurrentWindow();
    mainWindow.minimize();

    ipcRenderer.send('mouse-register');
    this.setState({registered : true});
  }

  createSnipWindow(x = 0, y = 0) {
    snipWindow = new BrowserWindow({
      x: x,
      y: y,
      width: 0,
      height: 0,
      frame : false,
      closable : false,
      alwaysOnTop : true,
      skipTaskbar : true,
      transparent : true,
      fullscreenable : false,
      enableLargerThanScreen : true,
      titleBarStyle : 'hidden',
      resizable : false,
      webPreferences : {
        nodeIntegration : true
      }
    });

    if (process.env.NODE_ENV === 'development') {
      snipWindow.loadURL(url.format({
        protocol: 'http:',
        host: 'localhost:8080',
        pathname: 'snip.html',
        slashes: true
      }));
    } else {
      snipWindow.loadURL(url.format({
        pathname: path.join(dirname, 'snip.html'),
        protocol: 'file:',
        slashes: true
      }));
    }

    return snipWindow;
  }

  handleMouseClick(event) {
    switch (this.state.state) {
      case REGION_STATE.SET:
        this.createSnipWindow(event.x, event.y);
        this.setState({state : REGION_STATE.DRAG});
        break;
      case REGION_STATE.DRAG:
        mainWindow.restore();
        mainWindow.focus();
        this.props.setCapture(false);
        break;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    ipcRenderer.send('mouse-unregister');
    if(!snipWindow.isDestroyed()) snipWindow.destroy();
  }

  render() {
    return false;
  }
};

export default Capture;