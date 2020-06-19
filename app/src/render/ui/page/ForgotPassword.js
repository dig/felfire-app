const { remote } = require('electron'),
      userService = remote.require('./common/services/user.service');

import React from 'react';

import ForgotPasswordCSS from '../../assets/style/forgotpassword.css';
import Tick from '../../assets/img/done-tick.png'; 
import Square from '../../assets/img/square.png';
import Mark from '../../assets/img/danger.png';
import Reload from '../../assets/img/spin.png';

import CaptchaSlider from '../../components/CaptchaSlider';

import { PAGES } from '../../constants/app.constants';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email : '',

      errorMessage : '',
      shake : false,
      formDisabled : false,
      captcha: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleCaptchaComplete = this.handleCaptchaComplete.bind(this);
    this.handleShake = this.handleShake.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.state.captcha != '') {
      try {
        await userService.forgotPassword(this.state.email, this.state.captcha);
        this.props.changePage(PAGES.EMAILVERIFICATION, { title : 'Password Reset', email : this.state.email });
      } catch (err) {
        this.setState({
          errorMessage : (typeof err === 'string' ? err : err[0].msg),
          shake : true,
          formDisabled : false
        });

        this.handleShake();
      }
    } else {
      this.setState({
        errorMessage : 'Captcha failed, please try again.',
        shake : true
      });

      this.handleShake();
    }
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage(PAGES.LOGIN);
  }

  handleEmailChange(event) {
    let value = event.target.value;
    this.setState({email : value});
  }

  handleCaptchaComplete(token) {
    this.setState({captcha: token});
  }

  handleShake() {
    this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
  }

  componentWillUnmount() {
    clearTimeout(this.shakeID);
  }

  render() {
    return (
      <div className="forgot-password">
        <img className="square" src={Square} />

        <div className="container">
          <div className="header">
            <h3>Need help?</h3>
            <small>Please enter your email to recover your account.</small>
          </div>

          <form className="content" onSubmit={this.handleSubmit}>
            {this.state.errorMessage != '' &&
              <div className="error">
                <div className="content">
                  <img src={Mark} />
                  {this.state.errorMessage}
                </div>
              </div>
            }

            <div className="group">
              <input type="text" title="Enter your email" required name="email" value={this.state.email} onChange={this.handleEmailChange} />
            </div>

            {this.state.captcha == '' &&
              <div className="captcha">
                <CaptchaSlider onComplete={this.handleCaptchaComplete} />
              </div>
            }

            {this.state.captcha != '' &&
              <div className={'submit ' + (this.state.shake ? 'shake' : '')}>
                <input type="submit" value="RECOVER" disabled={this.state.formDisabled} />

                <div className="caption">
                  <img className={(this.state.formDisabled ? 'spinning' : '')} src={(this.state.formDisabled ? Reload : Tick)} />
                </div>
              </div>
            }

            <div className="link">
              <div className="box" onClick={this.handleLogin}>
                <small>Remembered your <b>Password</b>?</small>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default ForgotPassword;