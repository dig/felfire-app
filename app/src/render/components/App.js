const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');

import React from 'react';

import Toolbar from './Toolbar';
import Version from './Version';
import BaseCSS from '../assets/style/base.css';

import Changelog from '../ui/Changelog';
import EmailVerification from '../ui/EmailVerification';
import ForgotPassword from '../ui/ForgotPassword';
import Library from '../ui/Library';
import Load from '../ui/Load';
import Login from '../ui/Login';
import Register from '../ui/Register';

import User from '../utils/User';
import { remote } from 'electron';

const PAGES = {
  LOGIN: Login,
  REGISTER: Register,
  FORGOTPASSWORD: ForgotPassword,
  EMAILVERIFICATION: EmailVerification,
  LIBRARY: Library
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      loaded : false,
      loadOverlay : true,
      loadPercent : 0,

      changelogOverlay : false,

      accessToken : '',
      refreshToken : '',

      page : PAGES.LIBRARY,
      pageData : {}
    };

    this.changePage = this.changePage.bind(this);
    this.setLoadOverlay = this.setLoadOverlay.bind(this);
    this.setLoadOverlayPercent = this.setLoadOverlayPercent.bind(this);
    this.setChangelogOverlay = this.setChangelogOverlay.bind(this);

    this.getTokenConfig = this.getTokenConfig.bind(this);
    this.updateAccessToken = this.updateAccessToken.bind(this);
    this.updateRefreshToken = this.updateRefreshToken.bind(this);
    this.requestUserData = this.requestUserData.bind(this);
    this.logout = this.logout.bind(this);
  }

  changePage(pageName, data) {
    let page = PAGES[pageName];
    this.setState({
      page : page,
      pageData : data || {}
    });
  }

  setLoadOverlay(loadOverlay) {
    this.setState({
      loadOverlay : loadOverlay,
      loadPercent : 0
    });
  }

  setLoadOverlayPercent(loadPercent) {
    this.setState({loadPercent : loadPercent});
  }

  setChangelogOverlay(enabled) {
    if (!this.state.loadOverlay)
      this.setState({changelogOverlay : enabled});
  }

  getTokenConfig() {
    return new Promise((resolve, reject) => {
      storage.get('token', function(error, data) {
        if (error) throw reject();
        resolve(data);
      });
    });
  }

  updateAccessToken(accessToken) {
    this.setState({
      loaded : true,
      accessToken : accessToken
    });
  }

  updateRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
      storage.set('token', refreshToken, (error) => {
        if (error) reject();
        this.setState({refreshToken : refreshToken});
        resolve(refreshToken);
      });
    });
  }

  requestUserData() {
    this.getTokenConfig().then((refreshToken) => {
      if (refreshToken) {
        this.updateRefreshToken(refreshToken)
          .then(() => User.refreshAccessToken(refreshToken))
          .then((accessToken) => {
            this.setState({
              loaded : true,
              loadOverlay : false,
              page : PAGES.LIBRARY,
              accessToken : accessToken
            });
          })
          .catch((error) => {
            console.log(`Error with refreshing token: ${error}`);
            this.setState({page : PAGES.LOGIN, loadOverlay : false});
          });
      } else {
        console.log(`refreshToken not inside config`);
        this.setState({page : PAGES.LOGIN, loadOverlay : false});
      }
    }).catch((error) => {
      console.log(`Error with fetching tokenConfig: ${error}`);
      this.setState({page : PAGES.LOGIN, loadOverlay : false});
    });
  }

  logout() {
    this.updateRefreshToken('')
      .then(() => this.changePage('LOGIN'));
  }

  componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState({loadPercent : Math.min(1, this.state.loadPercent + 0.05)});
    }, 50);

    setTimeout(this.requestUserData, 1000);

    //--- TODO: Check if accessToken has expired and refresh

    //--- Check if new version was downloaded
    storage.get('version', (error, data) => {
      if (data && remote.app.getVersion() != data) {
        storage.set('version', remote.app.getVersion());

        this.versionID = setInterval(() => {
          if (!this.state.loadOverlay) {
            this.setState({changelogOverlay : true});
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
    let Page = this.state.page;

    return (
      <div className="app">
        <Toolbar background={(this.state.loaded && this.state.refreshToken != '' && this.state.accessToken != '' ? 'on' : '')} />

        {this.state.changelogOverlay &&
          <Changelog setChangelogOverlay={this.setChangelogOverlay} />
        }

        <div className="page">
          {this.state.loadOverlay &&
            <Load percent={this.state.loadPercent} />
          }

          <Page 
            pageData={this.state.pageData} 
            changePage={this.changePage} 
            setLoadOverlay={this.setLoadOverlay} 
            updateAccessToken={this.updateAccessToken} 
            updateRefreshToken={this.updateRefreshToken} 
            logout={this.logout}
          />
        </div>

        <Version setChangelogOverlay={this.setChangelogOverlay} />
      </div>
    );
  }
}

export default App;