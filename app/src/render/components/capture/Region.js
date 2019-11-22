const { ipcRenderer, remote, desktopCapturer, nativeImage } = require('electron'),
      { BrowserWindow, screen } = remote,
      path = require('path'),
      url = require('url'),
      mergeImg = require('merge-img'),
      dirname = remote.getGlobal('dir') || '/';

import React from 'react';

import { OVERLAY } from '../../constants/app.constants';
import { REGION_STATE } from '../../constants/capture.constants';

let snipWindows = [],
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
    this.createSnipWindows = this.createSnipWindows.bind(this);
    this.destroySnipWindows = this.destroySnipWindows.bind(this);
    this.sendToAllSnipWindows = this.sendToAllSnipWindows.bind(this);

    this.load = this.load.bind(this);
    this.crop = this.crop.bind(this);

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
    this.handleStreamToBuffer = (stream) => {
      return new Promise((resolve, reject) => {
        let video = document.createElement('video');
        video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

        video.onloadedmetadata = () => {
          video.style.height = `${video.videoHeight}px`;
          video.style.width = `${video.videoWidth}px`;
          video.play();

          let canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          let ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          let b64 = canvas.toDataURL('image/png');

          video.remove();
          try {
            stream.getTracks()[0].stop();
          } catch (e) {
            reject(e);
          }

          var data = b64.replace(/^data:image\/\w+;base64,/, "");
          var buffer = new Buffer(data, 'base64');
          resolve(buffer);
        };
        
        video.srcObject = stream;
        document.body.appendChild(video);
      });
    };

    return new Promise((resolve, reject) => {
      desktopCapturer.getSources({types: ['screen']}).then(async sources => {
        let buffers = [];

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
  
            let buffer = await this.handleStreamToBuffer(stream);
            buffers.push(buffer);
          } catch (e) {
            reject(e);
          }
        }
  
        this.setState({buffers : buffers}, () => resolve());
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

        try {
          await this.load();
          this.crop(event.x, event.y);
        } catch (err) {
          console.log(err);
        }

        mainWindow.restore();
        mainWindow.focus();

        this.props.setCapture(false);
        break;
    }
  }

  async crop(x2, y2) {
    let x = this.state.x,
        y = this.state.y;

    let minX = Math.min(x, x2),
        minY = Math.min(y, y2);

    let maxX = Math.max(x, x2),
        maxY = Math.max(y, y2);

    try {
      let image = await mergeImg(this.state.buffers);
      let crop = image.crop(minX, minY, maxX - minX, maxY - minY);
  
      crop.getBase64('image/png', (err, b64) => this.props.setOverlay(true, OVERLAY.PICTURE, {
        imageUrl : b64
      }));
    } catch (err) {
      console.log(err);
    }
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