import React from 'react';

import ForgotPasswordCSS from '../assets/style/forgotpassword.css';
import Mail from '../assets/img/mail.png';
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';
import Reload from '../assets/img/spin.png';

import User from '../utils/User';
import { ReCaptcha } from 'react-recaptcha-v3';

const RECAPTCHA_SITE_KEY = '6LeTIcMUAAAAABRMBLlMwV0rk3EheTnLh9SHsyOy';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email : '',
      recaptchaToken: '',

      errorMessage : '',
      shake : false,
      formDisabled : false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleCaptchaChange = this.handleCaptchaChange.bind(this);
    this.handleShake = this.handleShake.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.recaptchaToken != '') {
      User.requestPasswordReset(this.state.email, this.state.recaptchaToken).then(() => {
        this.props.changePage('EMAILVERIFICATION', { title : 'Password Reset', email : this.state.email });
      })
      .catch((errors) => {
        this.setState({
          errorMessage : (typeof errors === 'string' ? errors : errors[0].msg),
          shake : true,
          formDisabled : false
        });

        this.handleShake();

        //--- Refresh token after use
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action : 'register' })
          .then((token) => this.handleCaptchaChange(token));
      });
    } else {
      this.setState({
        errorMessage : 'Recaptcha failed, please try again.',
        shake : true
      });

      this.handleShake();
    }
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
  }

  handleEmailChange(event) {
    let value = event.target.value;
    this.setState({email : value});
  }

  handleCaptchaChange(recaptchaToken) {
    this.setState({recaptchaToken: recaptchaToken});
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

        <ReCaptcha
          sitekey={RECAPTCHA_SITE_KEY}
          action='forgotpassword'
          verifyCallback={this.handleCaptchaChange}
        />

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

            <div className="link">
              <small onClick={this.handleLogin}>Remember your password?</small>
            </div>

            <div className={'submit ' + (this.state.shake ? 'shake' : '')}>
              <input type="submit" value="RECOVER" disabled={this.state.formDisabled} />

              <div className="caption">
                <img className={(this.state.formDisabled ? 'spinning' : '')} src={(this.state.formDisabled ? Reload : Mail)} />
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default ForgotPassword;