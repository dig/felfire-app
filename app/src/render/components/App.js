const { ipcRenderer, remote } = require('electron'),
      authService = remote.require('./common/services/auth.service'),
      storage = require('electron-json-storage'),
      Store = require('electron-store'),
      jwtDecode = require('jwt-decode'),
      moment = require('moment');

const store = new Store();

import React from 'react';

import Toolbar from './Toolbar';
import Version from './Version';
import BaseCSS from '../assets/style/base.css';

import { PAGES, OVERLAY, CAPTURE } from '../constants/app.constants';
import { MODE } from '../constants/login.constants';

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
    this.getPageRef = this.getPageRef.bind(this);
    this.changePage = this.changePage.bind(this);
    this.setCapture = this.setCapture.bind(this);

    this.requestUserData = this.requestUserData.bind(this);
    this.checkAccessToken = this.checkAccessToken.bind(this);
    this.getUserMode = this.getUserMode.bind(this);

    this.pageRef = React.createRef();

    ipcRenderer.on('set-overlay', (event, enabled, overlayName) => this.setOverlay(enabled, OVERLAY[overlayName]));
    ipcRenderer.on('set-capture', (event, enabled, captureName) => this.setCapture(enabled, CAPTURE[captureName]));
  }

  setOverlay(enabled, overlay, data) {
    this.setState({
      overlayActive : enabled,
      overlay : overlay,
      overlayData : data || {}
    });
  }

  getPageRef() {
    return this.pageRef;
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

      ipcRenderer.send('login');
    } catch (err) {
      target = PAGES.LOGIN;
    }

    this.setState({
      overlayActive : false,
      page : target
    });
  }

  async checkAccessToken() {
    let accessToken = authService.getAccessToken();

    if (accessToken != null) {
      let decoded = jwtDecode(accessToken);
      let now = moment().add(5, 'minutes').unix();

      if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
        try {
          await authService.refreshAccessToken();
        } catch (err) {
          this.setState({
            captureActive : false,
            overlayActive : false,
            page : PAGES.LOGIN
          });

          ipcRenderer.send('logout');
        }
      }
    }
  }

  getUserMode() {
    return store.get('mode', MODE.PREVIEW);
  }

  componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState({overlayData : {
        percent : Math.min(1, this.state.overlayData.percent + 0.05)
      }});
    }, 25);

    this.requestTimeoutID = setTimeout(this.requestUserData, 600);
    this.accessIntervalID = setInterval(this.checkAccessToken, 60 * 1000);

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

    clearTimeout(this.requestTimeoutID);
    clearInterval(this.accessIntervalID);
  }

  render() {
    let Overlay = this.state.overlay;
    let Page = this.state.page;
    let Capture = this.state.capture;

    return (
      <div className="app">
        <Toolbar background={(Page == PAGES.LIBRARY ? 'on' : '')} />

        {this.state.overlayActive &&
          <Overlay 
            overlayData={this.state.overlayData} 
            setOverlay={this.setOverlay} 
            getPageRef={this.getPageRef}
            setCapture={this.setCapture}
            getUserMode={this.getUserMode}
          />
        }

        {this.state.page != null &&
          <div className="page">
            <Page 
              ref={this.pageRef}
              pageData={this.state.pageData} 
              changePage={this.changePage} 
              setOverlay={this.setOverlay}
              setCapture={this.setCapture}
              getUserMode={this.getUserMode}
            />
          </div>
        }

        {this.state.captureActive &&
          <Capture 
            setOverlay={this.setOverlay} 
            getPageRef={this.getPageRef}
            setCapture={this.setCapture} 
            getUserMode={this.getUserMode}
          />
        }

        <Version setOverlay={this.setOverlay} />
      </div>
    );
  }
}

export default App;