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
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
              <p>TODO - Being made rn.</p>
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
            <h3>Pick mode</h3>
            <small>Adjustable in settings</small>

            <div className="grid">
              <div className={'cell ' + (this.state.mode === MODE.PREVIEW ? 'active' : '')} onClick={() => this.handleModeClick(MODE.PREVIEW)}>
                1
              </div>

              <div className={'cell ' + (this.state.mode === MODE.EXPRESS ? 'active' : '')} onClick={() => this.handleModeClick(MODE.EXPRESS)}>
                2
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