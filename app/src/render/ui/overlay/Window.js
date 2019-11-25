const { desktopCapturer } = require('electron'),
      log = require('electron-log'),
      imageUtil = require('../../utils/Image');

import React from 'react';

import WindowCSS from '../../assets/style/window.css';
import { OVERLAY } from '../../constants/app.constants';

class Window extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      windows : []
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }

  async handleWindowClick(index) {
    if (this.props.isUploading()) return;
    this.props.setUpload(true);

    let monitor = this.state.windows[index];

    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
           mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: monitor.id,
            minWidth: 1280,
            maxWidth: 4000,
            minHeight: 720,
            maxHeight: 4000
          }
        }
      });

      let buffer = await imageUtil.getStreamToBuffer(stream);
      let image = await imageUtil.getBufferToJimp(buffer);
      let response = await imageUtil.handleImageAfterCapture(image);

      this.props.setUpload(false);
      if (response.hasOwnProperty('upload')) { 
        this.props.getPageRef().current.refreshImages();
        this.props.setOverlay(false); 
      } else {
        this.props.setOverlay(true, OVERLAY.PICTURE, { imageUrl : response.base64 });
      }
    } catch (err) {
      log.error(err);
      this.props.setUpload(false);
    }
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