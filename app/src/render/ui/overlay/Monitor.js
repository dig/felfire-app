const { desktopCapturer } = require('electron'),
      ImageUtil = require('../../utils/Image');

import React from 'react';

import MonitorCSS from '../../assets/style/monitor.css';

import { OVERLAY, CAPTURE } from '../../constants/app.constants';

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

      let buffer = await ImageUtil.getStreamToBuffer(stream);
      let image = await ImageUtil.getBufferToJimp(buffer);

      image.getBase64('image/png', (err, b64) => this.props.setOverlay(true, OVERLAY.PICTURE, {
        imageUrl : b64
      }));
    } catch (e) {
      console.log(e);
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