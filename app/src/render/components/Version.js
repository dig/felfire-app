const { ipcRenderer, remote } = require('electron');

import React from 'react';

import VersionCSS from '../assets/style/version.css';
import Reload from '../assets/img/reload.png';

import { OVERLAY } from '../constants/app.constants';
import { BOUNCE_INTERVAL, DOWNLOAD_STATE } from '../constants/version.constants';

class Version extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      version : (process.env.NODE_ENV === 'development' ? 'Development Build' : `v${remote.app.getVersion()}`),
      status : (process.env.NODE_ENV === 'development' ? DOWNLOAD_STATE.LATEST_VERSION : DOWNLOAD_STATE.CHECKING_FOR_UPDATE),
      percent : 0,

      vibrate : false
    };

    ipcRenderer.on('checking-for-update', () => this.setState({status : DOWNLOAD_STATE.CHECKING_FOR_UPDATE}));
    ipcRenderer.on('update-available', () => this.setState({status : DOWNLOAD_STATE.UPDATE_AVAILABLE}));
    ipcRenderer.on('update-not-available', () => this.setState({status : DOWNLOAD_STATE.LATEST_VERSION}));
    ipcRenderer.on('update-error', () => this.setState({status : DOWNLOAD_STATE.LATEST_VERSION}));
    ipcRenderer.on('update-progress', (channel, percent) => this.setState({pecent : (percent / 100)}));

    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleChangelogClick = this.handleChangelogClick.bind(this);
    this.tick = this.tick.bind(this);

    ipcRenderer.send('update-check');
  }

  componentDidMount() {
    this.vibrateIntervalID = setInterval(() => {
      this.setState({vibrate : true});
      this.vibrateTimeoutID = setTimeout(() => this.setState({vibrate : false}), 1000);
    }, BOUNCE_INTERVAL);

    this.tickID = setInterval(() => this.tick(), 100);
  }

  componentWillUnmount() {
    clearInterval(this.vibrateIntervalID);
    clearInterval(this.tickID);
    clearTimeout(this.vibrateTimeoutID);
  }

  tick() {
    if (this.state.status === DOWNLOAD_STATE.DOWNLOADING)
      this.setState({percent : (this.state.percent + 0.05 > 1 ? 0 : this.state.percent + 0.05)});
  }

  handleUpdate(event) {
    event.preventDefault();

    this.setState({status : DOWNLOAD_STATE.DOWNLOADING});
    ipcRenderer.send('update-install');
  }

  handleChangelogClick() {
    this.props.setOverlay(true, OVERLAY.CHANGELOG);
  }

  render() {
    return (
      <div className="footer-version">
        {this.state.status === DOWNLOAD_STATE.LATEST_VERSION &&
          <div className="latest" onClick={this.handleChangelogClick}>
            {this.state.version}{(process.env.NODE_ENV === 'development' ? '' : ':Latest')}
          </div>
        }

        {this.state.status === DOWNLOAD_STATE.CHECKING_FOR_UPDATE &&
          <div className="update-check">
            {this.state.version}
            <img className="spinning" src={Reload} />
          </div>
        }

        {this.state.status === DOWNLOAD_STATE.UPDATE_AVAILABLE &&
          <div className="update-available">
            {this.state.version}
            <div className={(this.state.vibrate ? 'vibrate' : '')} onClick={this.handleUpdate}>
              UPDATE
            </div>
          </div>
        }

        {this.state.status === DOWNLOAD_STATE.DOWNLOADING &&
          <div className="update-downloading">
            <div className="progress">
              <div className="inner" style={{width : `${this.state.percent * 100}%`}}>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Version;