const { remote } = require('electron');

import React from 'react';

import CaptureCSS from '../../assets/style/capture.css';
import Screenshot from '../../assets/img/screenshot.png';
import Fullscreen from '../../assets/img/fullscreen.png';
import Upload from '../../assets/img/upload.png';

import { CAPTURE } from '../../constants/app.constants';

class Capture extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    this.handleCaptureRegion = this.handleCaptureRegion.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }

  handleCaptureRegion() {
    this.props.setCapture(true, CAPTURE.REGION)
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
          
            <div className="button">
              <img className="fullscreen" src={Fullscreen} />
              <h4>Capture Monitor</h4>
            </div>
          </div>

          <div className="bottom">
            <img src={Upload} />
            <h4>Select images to upload</h4>
          </div>
        </div>
      </div>
    )
  }
}

export default Capture;