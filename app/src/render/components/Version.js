const { ipcRenderer, remote } = require('electron');

import React from 'react';

import VersionCSS from '../assets/style/version.css';
import Reload from '../assets/img/reload.png';
import { clearInterval } from 'timers';

const BOUNCE_INTERVAL = 15000;
const DOWNLOAD_STATE = {
  LATEST_VERSION: 'LATEST_VERSION',
  CHECKING_FOR_UPDATE: 'CHECKING_FOR_UPDATE',
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  DOWNLOADING: 'DOWNLOADING'
};

class Version extends React.Component {
  constructor() {
    super();

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
    ipcRenderer.send('update-check');
  }

  componentDidMount() {
    this.vibrateIntervalID = setInterval(() => {
      this.setState({vibrate : true});
      this.vibrateTimeoutID = setTimeout(() => this.setState({vibrate : false}), 1000);
    }, BOUNCE_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.vibrateIntervalID);
    clearTimeout(this.vibrateTimeoutID);
  }

  handleUpdate(event) {
    event.preventDefault();

    this.setState({status : DOWNLOAD_STATE.DOWNLOADING});
    ipcRenderer.send('update-install');
  }

  handleChangelogClick() {
    this.props.setChangelogOverlay(true);
  }

  render() {
    return (
      <div className="footer-version noselect">
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