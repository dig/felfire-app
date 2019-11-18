const { ipcRenderer } = require('electron');

import React from 'react';

import LoginCSS from '../assets/style/login.css';
import Picture from '../assets/img/login.svg'; 
import Padlock from '../assets/img/padlock-unlock.png';
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';
import Reload from '../assets/img/spin.png';

import User from '../utils/User';

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

  handleSubmit(event) {
    event.preventDefault();
    this.setState({formDisabled : true});

    //--- Request login
    User.login(event.target.email.value, event.target.password.value).then((data) => {
      this.setState({formDisabled : false});
      if (data != null) {
        if (data.refreshToken && data.accessToken) {
          this.props.updateRefreshToken(data.refreshToken).then(() => {
            this.props.updateAccessToken(data.accessToken);
            this.props.changePage('LIBRARY');
          });
        } else {
          this.props.changePage('EMAILVERIFICATION', { email : data.email });
        }
      }
    })
    .catch(() => {
      this.setState({
        error : true,
        shake : true,
        formDisabled : false
      });
      this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
    });
  }

  componentWillUnmount() {
    clearTimeout(this.shakeID);
  }

  handleRegister(event) {
    event.preventDefault();
    this.props.changePage('REGISTER');
  }

  handleForgottenPassword(event) {
    event.preventDefault();
    this.props.changePage('FORGOTPASSWORD');
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