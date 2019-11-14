const { ipcRenderer, remote } = require('electron');

import React from 'react';

import VersionCSS from '../assets/style/version.css';
import Reload from '../assets/img/reload.png';
import { clearInterval } from 'timers';

const BOUNCE_INTERVAL = 15000;

class Version extends React.Component {
  constructor() {
    super();

    this.state = {
      version : (process.env.NODE_ENV === 'development' ? 'Development Build' : `v${remote.app.getVersion()}`),
      checkingForUpdate : !(process.env.NODE_ENV === 'development'),
      updateAvailable : false,

      vibrate : false
    };

    ipcRenderer.on('checking-for-update', () => {
      this.setState({
        checkingForUpdate : true,
        updateAvailable : false
      });
    });

    ipcRenderer.on('update-downloaded', () => {
      this.setState({
        checkingForUpdate : false,
        updateAvailable : true
      });
    });

    ipcRenderer.on('update-not-available', () => {
      this.setState({
        checkingForUpdate : false,
        updateAvailable : false
      });
    });

    ipcRenderer.on('update-error', () => {
      this.setState({
        checkingForUpdate : false,
        updateAvailable : false
      });
    });


    this.handleUpdate = this.handleUpdate.bind(this);
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
    ipcRenderer.send('update-apply');
  }

  render() {
    return (
      <div className="footer-version noselect">
        {!this.state.checkingForUpdate && !this.state.updateAvailable &&
          <div>
            {this.state.version}{(process.env.NODE_ENV === 'development' ? '' : ':Latest')}
          </div>
        }

        {this.state.checkingForUpdate && !this.state.updateAvailable &&
          <div className="update-check">
            {this.state.version}
            <img className="spinning" src={Reload} />
          </div>
        }

        {!this.state.checkingForUpdate && this.state.updateAvailable &&
          <div className="update-available">
            {this.state.version}
            <div className={(this.state.vibrate ? 'vibrate' : '')} onClick={this.handleUpdate}>
              UPDATE
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Version;