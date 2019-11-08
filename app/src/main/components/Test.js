import React from 'react';
const { desktopCapturer, ipcRenderer, screen, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

const Jimp = require('jimp');
const url = require('url');
const path = require('path');

var snipWindow = null;

class Test extends React.Component {
  constructor(props) {
    super (props);

    this.state = {
      imageSrc : '',
      record : false
    };

    ipcRenderer.on('mouse-click', (event, arg) => {
      console.log(arg);

      if (this.state.record) {
        if (!this.state.first) {
          this.setState({ first : arg });
          this.createSnipWindow(arg.x, arg.y);
        } else if (!this.state.second) {
          this.setState({ second : arg });
          this.state.second = arg;

          snipWindow.destroy();

          this.toggleRecording(false);
          this.takeScreenshot(function(base64data) {
            this.crop(base64data);
          });
        }
      }
    });
  }

  createSnipWindow(x, y) {
    snipWindow = new BrowserWindow({
      width: 0,
      height: 0,
      frame : false,
      transparent : true,
      closable : false,
      alwaysOnTop : true,
      skipTaskbar : true,
      resizable : false,
      parent : remote.getCurrentWindow()
    });

    snipWindow.loadURL(path.join('file://', $dirname, '/assets/html/snip.html'));

    snipWindow.on('closed', () => {
      snipWindow = null;
    });

    snipWindow.setPosition(x, y);

    setInterval(() => {
      let pos = screen.getCursorScreenPoint();
      this.updateSnipWindow(pos.x, pos.y);
    }, 100);
  }

  updateSnipWindow(x, y) {
    if (snipWindow != null) {
      let pos = snipWindow.getPosition();
      snipWindow.setSize(x - pos[0], y - pos[1]);
    }
  }

  toggleRecording(state) {
    this.setState({ record : state });
    ipcRenderer.send('mouse-listen', state);
  }

  handleClick() {
    if (!this.state.record) {
      this.toggleRecording(true);
    }
  }

  crop(base64data) {
    let encondedImageBuffer = new Buffer(base64data.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');

    Jimp.read(encondedImageBuffer, (err, image) => {
        if (err) throw err;

        let width = this.state.second.x - this.state.first.x;
        let height = this.state.second.y - this.state.first.y;
        let crop = image.crop(this.state.first.x, this.state.first.y, parseInt(width, 10), parseInt(height, 10));

        crop.getBase64('image/png', (err, base64data) =>{
            this.setState({
              imageSrc : base64data,
              first : undefined,
              second : undefined
            });
        });
    });
  }

  takeScreenshot(callback) {
    let _this = this;
    this.callback = callback;

    this.handleStream = (stream) => {
        // Create hidden video tag
        let video_dom = document.createElement('video');
        video_dom.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
        // Event connected to stream
        video_dom.onloadedmetadata = function () {
            // Set video ORIGINAL height (screenshot)
            video_dom.style.height = this.videoHeight + 'px'; // videoHeight
            video_dom.style.width = this.videoWidth + 'px'; // videoWidth

            // Create canvas
            let canvas = document.createElement('canvas');
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
            let ctx = canvas.getContext('2d');
            // Draw video on canvas
            ctx.drawImage(video_dom, 0, 0, canvas.width, canvas.height);

            if (_this.callback) {
                // Save screenshot to base64
                _this.callback(canvas.toDataURL('image/png'));
            }

            // Remove hidden video tag
            video_dom.remove();
            try {
                // Destroy connect to stream
                stream.getTracks()[0].stop();
            } catch (e) {}
        };
        // video_dom.src = URL.createObjectURL(stream);
        video_dom.srcObject = stream;
        document.body.appendChild(video_dom);
    };

    this.handleError = (e) => {
        console.log(e);
    };

    desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
        if (error) throw error;
        console.log(sources);
        for (let i = 0; i < sources.length; ++i) {

            // Filter: main screen
            if (sources[i].name === "Screen 1") {
                navigator.webkitGetUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: sources[i].id,
                            minWidth: 1280,
                            maxWidth: 4000,
                            minHeight: 720,
                            maxHeight: 4000
                        }
                    }
                }, this.handleStream, this.handleError);

                return;
            }
        }
    });
  }

  render() {
    return (
      <div className="Test">
        <input onClick={this.handleClick.bind(this)} type="button" value="Take screenshot" />
        <img src={this.state.imageSrc} />
      </div>
    );
  }
}

export default Test;