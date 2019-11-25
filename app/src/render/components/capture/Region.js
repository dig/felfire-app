const { ipcRenderer, remote, desktopCapturer } = require('electron'),
      { BrowserWindow, screen } = remote,
      log = require('electron-log'),
      path = require('path'),
      url = require('url'),
      Jimp = require('jimp'),
      imageUtil = require('../../utils/Image'),
      dirname = remote.getGlobal('dir') || '/';

import React from 'react';

import { OVERLAY } from '../../constants/app.constants';
import { REGION_STATE } from '../../constants/capture.constants';
import { MODE } from '../../constants/login.constants';

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

    this.load = this.load.bind(this);
    this.crop = this.crop.bind(this);
    this.createFullImage = this.createFullImage.bind(this);

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

  load() {
    return new Promise((resolve, reject) => {
      desktopCapturer.getSources({types: ['screen']}).then(async sources => {
        let images = [];

        let minX = 0,
            minY = 0;

        for (let display of screen.getAllDisplays()) {
          let source = sources.find(source => source.display_id == display.id.toString());

          try {
            let stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                 mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minWidth: 1280,
                  maxWidth: 4000,
                  minHeight: 720,
                  maxHeight: 4000
                }
              }
            });
  
            let buffer = await imageUtil.getStreamToBuffer(stream);
            let image = await imageUtil.getBufferToJimp(buffer);

            minX = Math.min(minX, display.bounds.x);
            minY = Math.min(minY, display.bounds.y);

            images.push({
              jimp : image,
              x : display.bounds.x,
              y : display.bounds.y
            });
          } catch (e) {
            reject(e);
          }
        }
  
        this.setState({
          images : images,
          minX : minX,
          minY : minY
        }, () => resolve());
      });
    });
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
          pathname: 'snip.html',
          slashes: true
        }));
      } else {
        window.loadURL(url.format({
          pathname: path.join(dirname, 'snip.html'),
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
        this.props.setUpload(true);

        try {
          await this.load();
          let response = await imageUtil.handleImageAfterCapture(this.crop(event.x, event.y));

          this.props.setUpload(false);
          if (response.hasOwnProperty('upload')) {
            this.props.getPageRef().current.refreshImages();
            this.props.setOverlay(false);
          } else {
            this.props.setOverlay(true, OVERLAY.PICTURE, { imageUrl : response.base64 });
          }
        } catch (err) {
          this.props.setUpload(false);
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

  crop(x2, y2) {
    let x = this.state.x,
        y = this.state.y;

    let minX = Math.min(x, x2),
        minY = Math.min(y, y2);

    let maxX = Math.max(x, x2),
        maxY = Math.max(y, y2);

    let image = this.createFullImage(this.state.images);
    let crop = image.crop(minX - this.state.minX, minY - this.state.minY, maxX - minX, maxY - minY);

    return crop;
  }

  createFullImage(images) {
    let totalWidth = 0,
        totalHeight = 0;

    for (let image of images) {
      let width = image.x + image.jimp.bitmap.width;
      if (width > totalWidth) totalWidth = width;

      let height = image.y + image.jimp.bitmap.height;
      if (height > totalHeight) totalHeight = height;
    } 

    let baseImage = new Jimp(totalWidth - this.state.minX, totalHeight - this.state.minY, 0x00000000);
    for (let image of images)
      baseImage.composite(image.jimp, image.x - this.state.minX, image.y - this.state.minY);

    return baseImage;
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