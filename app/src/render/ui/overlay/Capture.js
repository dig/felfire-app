import React from 'react';

import CaptureCSS from '../../assets/style/capture.css';
import Screenshot from '../../assets/img/screenshot.png';
import Fullscreen from '../../assets/img/fullscreen.png';
import Upload from '../../assets/img/upload.png';
import Window from '../../assets/img/window.png';
import Play from '../../assets/img/play.png';

import { OVERLAY, CAPTURE } from '../../constants/app.constants';

class Capture extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    this.handleCaptureRegion = this.handleCaptureRegion.bind(this);
    this.handleCaptureMonitor = this.handleCaptureMonitor.bind(this);
    this.handleCaptureWindow = this.handleCaptureWindow.bind(this);
    this.handleCaptureVideo = this.handleCaptureVideo.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }

  handleCaptureRegion() {
    this.props.setCapture(true, CAPTURE.REGION);
  }

  handleCaptureMonitor() {
    this.props.setOverlay(true, OVERLAY.MONITOR);
  }

  handleCaptureWindow() {
    this.props.setOverlay(true, OVERLAY.WINDOW);
  }

  handleCaptureVideo() {
    this.props.setCapture(true, CAPTURE.VIDEO);
  }

  render() {
    return (
      <div className="capture">
        <div className="background" onClick={this.handleClose}></div>

        <div className="container">
          <div className="top">
            <div className="button" onClick={this.handleCaptureRegion}>
              <img src={Screenshot} />
              <h4>Capture Region</h4>
            </div>
          
            <div className="button" onClick={this.handleCaptureMonitor}>
              <img className="fullscreen" src={Fullscreen} />
              <h4>Capture Monitor</h4>
            </div>

            <div className="button" onClick={this.handleCaptureWindow}>
              <img src={Window} />
              <h4>Capture Window</h4>
            </div>
          </div>

          <div className="bottom">
            <div className="button select">
              <img src={Upload} />
              <h4>Select images to upload</h4>
            </div>

            <div className="button" onClick={this.handleCaptureVideo}>
              <img src={Play} />
              <h4>Capture Video</h4>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Capture;