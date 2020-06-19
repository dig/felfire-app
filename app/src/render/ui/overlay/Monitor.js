const { desktopCapturer, remote, ipcRenderer } = require('electron'),
      { app, screen } = remote,
      log = require('electron-log'),
      imageUtil = require('../../utils/Image');

import React from 'react';
import MonitorCSS from '../../assets/style/monitor.css';

import { OVERLAY } from '../../constants/app.constants';
import { MODE } from '../../constants/login.constants';

class Monitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitors : []
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleMonitorClick = this.handleMonitorClick.bind(this);
    this.screenshot = this.screenshot.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }

  async handleMonitorClick(index) {
    let display = this.state.monitors[index];
    let monitor = screen.getAllDisplays().find((screen) => screen.id.toString() == display.display_id);

    if (monitor != null) {
      try {
        let imagePath = await this.screenshot(monitor);
        
        if (this.props.getUserMode() === MODE.INSTANT) {
          await imageUtil.handleUpload(imagePath);
          this.props.setOverlay(false);
        } else {
          this.props.setOverlay(true, OVERLAY.PICTURE, { imageUrl : imagePath });
        }

        //--- Refresh library
        this.props.getPageRef().current.refresh();
      } catch (err) {
        log.error(err);
      }
    }
  }

  screenshot(monitor) {
    return new Promise((resolve, reject) => {
      let key = new Date().getTime();
      let path = `${app.getPath('temp')}/${key}.png`;

      ipcRenderer.once('screenshot-response', (event, key, err) => (err ? reject() : resolve(path)));
      ipcRenderer.send('screenshot', key, monitor.bounds.x, monitor.bounds.y, monitor.bounds.width, monitor.bounds.height, path);
    });
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