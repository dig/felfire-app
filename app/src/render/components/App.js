const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');

import React from 'react';

import Toolbar from './Toolbar';
import Main from '../assets/style/main.css';

import EmailVerification from '../ui/EmailVerification';
import ForgotPassword from '../ui/ForgotPassword';
import Library from '../ui/Library';
import Load from '../ui/Load';
import Login from '../ui/Login';
import Register from '../ui/Register';

import User from '../utils/User';

const pages = {
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

      accessToken : '',
      refreshToken : '',

      page : pages.LIBRARY,
      pageData : {}
    };

    this.changePage = this.changePage.bind(this);
    this.setLoadOverlay = this.setLoadOverlay.bind(this);
    this.setLoadOverlayPercent = this.setLoadOverlayPercent.bind(this);

    this.getTokenConfig = this.getTokenConfig.bind(this);
    this.updateAccessToken = this.updateAccessToken.bind(this);
    this.updateRefreshToken = this.updateRefreshToken.bind(this);
    this.requestUserData = this.requestUserData.bind(this);
  }

  changePage(pageName, data) {
    this.setState({
      page : pages[pageName],
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
              page : pages.LIBRARY,
              accessToken : accessToken
            });
          })
          .catch((error) => {
            console.log(`Error with refreshing token: ${error}`);
            this.setState({page : pages.LOGIN, loadOverlay : false});
          });
      } else {
        console.log(`refreshToken not inside config`);
        this.setState({page : pages.LOGIN, loadOverlay : false});
      }
    }).catch((error) => {
      console.log(`Error with fetching tokenConfig: ${error}`);
      this.setState({page : pages.LOGIN, loadOverlay : false});
    });
  }

  componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState({loadPercent : Math.min(1, this.state.loadPercent + 0.05)});
    }, 50);

    setTimeout(this.requestUserData, 1000);

    //--- TODO: Check if accessToken has expired and refresh
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    let Page = this.state.page;
    let background = (this.state.loaded ? 'on' : '');

    return (
      <div className="app">
        <Toolbar background={background} />
        <div className="page">
          {this.state.loadOverlay &&
            <Load percent={this.state.loadPercent} />
          }
          <Page pageData={this.state.pageData} changePage={this.changePage} setLoadOverlay={this.setLoadOverlay} updateAccessToken={this.updateAccessToken} updateRefreshToken={this.updateRefreshToken} />
        </div>
      </div>
    );
  }
}

export default App;