const { ipcRenderer, remote } = require('electron'),
      authService = remote.require('./common/services/auth.service'),
      Store = require('electron-store');

const store = new Store();

import React from 'react';

import LoginCSS from '../../assets/style/login.css';
import Picture from '../../assets/img/login.svg'; 
import Padlock from '../../assets/img/padlock-unlock.png';
import Square from '../../assets/img/square.png';
import Mark from '../../assets/img/danger.png';
import Reload from '../../assets/img/spin.png';
import Tick from '../../assets/img/done-tick.png';
import ArrowRight from '../../assets/img/arrow-right.png';

import Preview from '../../assets/img/preview.png';
import Instant from '../../assets/img/instant.png';

import { PAGES } from '../../constants/app.constants';
import { LOGIN, MODE } from '../../constants/login.constants';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error : false,
      shake : false,
      formDisabled : false,

      state : LOGIN.FORM,
      mode : null 
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleForgottenPassword = this.handleForgottenPassword.bind(this);
    this.handleNextState = this.handleNextState.bind(this);

    this.handleTosAgree = this.handleTosAgree.bind(this);
    this.handleTosReject = this.handleTosReject.bind(this);

    this.handleModeClick = this.handleModeClick.bind(this);
    this.handleModeSubmit = this.handleModeSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({formDisabled : true});

    try {
      let response = await authService.login(event.target.email.value, event.target.password.value);

      if (response && response.hasOwnProperty('verified')) {
        this.props.changePage(PAGES.EMAILVERIFICATION, { email : response.email });
      } else {
        this.handleNextState();
      }
    } catch (err) {
      this.setState({
        error : true,
        shake : true,
        formDisabled : false
      });

      this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.shakeID);
  }

  handleRegister(event) {
    event.preventDefault();
    this.props.changePage(PAGES.REGISTER);
  }

  handleForgottenPassword(event) {
    event.preventDefault();
    this.props.changePage(PAGES.FORGOTPASSWORD);
  }

  handleNextState() {
    if (store.has('tos') && store.has('mode')) {
      ipcRenderer.send('login');
      this.props.changePage(PAGES.LIBRARY);
    } else if (!store.has('tos')) {
      this.setState({state : LOGIN.TOS});
    } else {
      this.setState({state : LOGIN.MODE});
    }
  }

  handleTosAgree() {
    store.set('tos', true);
    this.handleNextState();
  }

  async handleTosReject() {
    await authService.logout();
    ipcRenderer.send('quit');
  }

  handleModeClick(mode) {
    this.setState({mode : mode});
  }

  handleModeSubmit() {
    if (this.state.mode != null) {
      store.set('mode', this.state.mode);
      this.handleNextState();
    }
  }

  render() {
    return (
      <div className="login">
        <img className="square" src={Square} />

        {this.state.state === LOGIN.FORM &&
          <div className="form">
            <div className="left">
              <img src={Picture} />
            </div>

            <div className="right">
              <div className="container">
                <div className="header">
                  <h3>Welcome back!</h3>
                  <small>Please enter your credentials to login.</small>
                </div>

                <form className="content" onSubmit={this.handleSubmit}>
                  {this.state.error &&
                    <div className="error">
                      <div className="content">
                        <img src={Mark} />
                        Incorrect email or password.
                      </div>
                    </div>
                  }

                  <div className="group">
                    <label>Email</label>
                    <input type="text" title="Enter your email" required name="email" />
                  </div>

                  <div className="group">
                    <label>Password</label>
                    <label className="over" onClick={this.handleForgottenPassword}>Forgot?</label>
                    <input type="password" title="Enter your password" required name="password" />
                  </div>

                  <div className={'submit ' + (this.state.shake ? 'shake' : '')}>
                    <input type="submit" value="LOGIN" disabled={this.state.formDisabled} />

                    <div className="caption">
                      <img className={(this.state.formDisabled ? 'spinning' : '')} src={(this.state.formDisabled ? Reload : Padlock)} />
                    </div>
                  </div>

                  <div className="link">
                    <div className="box" onClick={this.handleRegister}>
                      <small>Don't have an account? <b>Get Started</b></small>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }

        {this.state.state === LOGIN.TOS &&
          <div className="tos slide-right">
            <h3>Terms and Conditions</h3>

            <div className="container">
              <p>By clicking 'Agree', you agree to the following:</p>
              <p>Service allows uploading, managing and sharing of images uploaded by the user.</p>
              <p>User is responsible for security of their account.</p>
              <p>User is responsible for the content they upload.</p>
              <p>Under no circumstances will FelFire be liable for any content available by the service.</p>
              <p>FelFire does not pre screen content.</p>
              <p>FelFire preserves the right to remove any content uploaded by any user.</p>
              <p>FelFire's sole discretion as what action is taken when the Terms of Service is broken.</p>
              <p>User agrees to not upload, post, transmit or otherwise make available content that is unlawful, harmful, threatening, abusive or harassing.</p>
              <p>User agrees to not use the service to forward users to another service.</p>
              <b>New version of Terms of Service in progress.</b>
            </div>

            <div className="button">
              <input type="submit" value="Agree" onClick={this.handleTosAgree} />

              <div className="caption">
                <img src={Tick} />
              </div>
            </div>

            <div className="link">
              <div className="box" onClick={this.handleTosReject}>
                <small>Reject and quit</small>
              </div>
            </div>
          </div>
        }

        {this.state.state === LOGIN.MODE &&
          <div className="mode slide-right">
            <h3>Mode Preference</h3>
            <small>Adjustable in settings</small>

            <div className="grid">
              <div className={'cell ' + (this.state.mode === MODE.PREVIEW ? 'active' : '')} onClick={() => this.handleModeClick(MODE.PREVIEW)}>
                <p>Preview</p>
                <small>Preview images after capturing.</small>

                <img src={Preview} />
              </div>

              <div className={'cell ' + (this.state.mode === MODE.INSTANT ? 'active' : '')} onClick={() => this.handleModeClick(MODE.INSTANT)}>
                <p>Instant</p>
                <small>Instantly upload images after capturing.</small>

                <img src={Instant} />
              </div>
            </div>

            <div className={'button ' + (this.state.mode == null ? 'disabled' : '')}>
              <input type="submit" value="Continue" onClick={this.handleModeSubmit} />

              <div className="caption">
                <img src={ArrowRight} />
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Login;