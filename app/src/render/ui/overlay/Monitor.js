const { desktopCapturer } = require('electron'),
      log = require('electron-log'),
      imageUtil = require('../../utils/Image');

import React from 'react';

import MonitorCSS from '../../assets/style/monitor.css';

import { OVERLAY } from '../../constants/app.constants';

class Monitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitors : []
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleMonitorClick = this.handleMonitorClick.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }

  async handleMonitorClick(index) {
    if (this.props.isUploading()) return;
    this.props.setUpload(true);

    let monitor = this.state.monitors[index];

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
    desktopCapturer.getSources({types: ['screen']}).then(sources => this.setState({monitors : sources}));
  }

  render() {
    return (
      <div className="monitor">
        <div className="background" onClick={this.handleClose}></div>

        <div className="grid">
          {this.state.monitors.map((monitor, index) => {
            return <div key={index} className="cell" onClick={() => this.handleMonitorClick(index)}>
              <small>Monitor {index + 1}</small>
              <img src={monitor.thumbnail.toDataURL('image/png')} />
            </div>
          })}
        </div>
      </div>
    )
  }
}

export default Monitor;