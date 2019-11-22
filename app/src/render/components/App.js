const { remote } = require('electron'),
      authService = remote.require('./common/services/auth.service'),
      storage = require('electron-json-storage');

import React from 'react';

import Toolbar from './Toolbar';
import Version from './Version';
import BaseCSS from '../assets/style/base.css';

import { PAGES, OVERLAY, CAPTURE } from '../constants/app.constants';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      overlayActive : true,
      overlay : OVERLAY.LOAD,
      overlayData : {
        percent : 0
      },

      page : null,
      pageData : {},

      captureActive : false,
      capture : CAPTURE.REGION
    };

    this.setOverlay = this.setOverlay.bind(this);
    this.changePage = this.changePage.bind(this);
    this.setCapture = this.setCapture.bind(this);

    this.requestUserData = this.requestUserData.bind(this);
  }

  setOverlay(enabled, overlay, data) {
    this.setState({
      overlayActive : enabled,
      overlay : overlay,
      overlayData : data || {}
    });
  }

  changePage(page, data) {
    this.setState({
      page : page,
      pageData : data || {}
    });
  }

  setCapture(enabled, capture) {
    this.setState({
      captureActive : enabled,
      capture : capture
    });
  }

  async requestUserData() {
    let target;

    try {
      await authService.refreshAccessToken();
      target = PAGES.LIBRARY;
    } catch (err) {
      target = PAGES.LOGIN;
    }

    this.setState({
      overlayActive : false,
      page : target
    });
  }

  componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState({overlayData : {
        percent : Math.min(1, this.state.overlayData.percent + 0.05)
      }});
    }, 25);

    setTimeout(this.requestUserData, 600);

    //--- TODO: Check if accessToken has expired and refresh

    //--- Check if new version was downloaded
    storage.get('version', (error, data) => {
      if (data && remote.app.getVersion() != data) {
        storage.set('version', remote.app.getVersion());

        this.versionID = setInterval(() => {
          if (!this.state.overlayActive) {
            this.setOverlay(true, OVERLAY.CHANGELOG);
            clearInterval(this.versionID);
          }
        }, 100);
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    clearInterval(this.versionID);
  }

  render() {
    let Overlay = this.state.overlay;
    let Page = this.state.page;
    let Capture = this.state.capture;

    return (
      <div className="app">
        <Toolbar background={(authService.getAccessToken() != null ? 'on' : '')} />

        {this.state.overlayActive &&
          <Overlay 
            overlayData={this.state.overlayData} 
            setOverlay={this.setOverlay} 
            setCapture={this.setCapture}
          />
        }

        {this.state.page != null &&
          <div className="page">
            <Page 
              pageData={this.state.pageData} 
              changePage={this.changePage} 
              setOverlay={this.setOverlay}
              setCapture={this.setCapture}
            />
          </div>
        }

        {this.state.captureActive &&
          <Capture setCapture={this.setCapture} />
        }

        <Version setOverlay={this.setOverlay} />
      </div>
    );
  }
}

export default App;