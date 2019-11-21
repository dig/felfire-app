const { remote } = require('electron'),
      authService = remote.require('./common/services/auth.service');

import React from 'react';

import LoginCSS from '../../assets/style/login.css';
import Picture from '../../assets/img/login.svg'; 
import Padlock from '../../assets/img/padlock-unlock.png';
import Square from '../../assets/img/square.png';
import Mark from '../../assets/img/danger.png';
import Reload from '../../assets/img/spin.png';

import { PAGES } from '../../constants/app.constants';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error : false,
      shake : false,
      formDisabled : false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleForgottenPassword = this.handleForgottenPassword.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({formDisabled : true});

    try {
      let response = await authService.login(event.target.email.value, event.target.password.value);

      if (response && response.hasOwnProperty('verified')) {
        this.props.changePage(PAGES.EMAILVERIFICATION, { email : response.email });
      } else {
        this.props.changePage(PAGES.LIBRARY);
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

  render() {
    return (
      <div className="login">
        <img className="square" src={Square} />

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
    )
  }
}

export default Login;