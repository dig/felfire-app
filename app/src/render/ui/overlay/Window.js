const { desktopCapturer, remote, ipcRenderer } = require('electron'),
      { app, screen } = remote,
      log = require('electron-log'),
      imageUtil = require('../../utils/Image');

import React from 'react';
import WindowCSS from '../../assets/style/window.css';

import { OVERLAY } from '../../constants/app.constants';
import { MODE } from '../../constants/login.constants';

class Window extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      windows : []
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.screenshot = this.screenshot.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }

  async handleWindowClick(index) {
    let window = this.state.windows[index];

    if (window != null) {
      try {
        let imagePath = await this.screenshot(window);
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
    }
  }

  screenshot(window) {
    return new Promise((resolve, reject) => {
      let key = new Date().getTime();
      let path = `${app.getPath('temp')}/${key}.png`;

      ipcRenderer.once('screenshot-response', (event, key, err) => (err ? reject() : resolve(path)));
      ipcRenderer.send('screenshot-window', key, window.name, path);
    });
  }

  componentDidMount() {
    desktopCapturer.getSources({types: ['window']}).then(sources => this.setState({windows : sources}));
  }

  render() {
    return (
      <div className="window">
        <div className="background" onClick={this.handleClose}></div>

        <div className="grid">
          {this.state.windows.map((window, index) => {
            return <div key={index} className="cell" onClick={() => this.handleWindowClick(index)}>
              <small>{window.name}</small>
              <img src={window.thumbnail.toDataURL('image/png')} />
            </div>
          })}
        </div>
      </div>
    )
  }
}

export default Window;