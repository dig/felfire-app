import React from 'react';

import ForgotPasswordCSS from '../assets/style/forgotpassword.css';
import Mail from '../assets/img/mail.png';
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';
import Reload from '../assets/img/spin.png';

import User from '../utils/User';
import ReCAPTCHA from 'react-google-recaptcha';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email : '',

      errorMessage : '',
      shake : false,
      formDisabled : false,
      captcha : false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleCaptchaChange = this.handleCaptchaChange.bind(this);
    this.handleCaptchaExpired = this.handleCaptchaExpired.bind(this);
    this.handleCaptchaErrored = this.handleCaptchaErrored.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      formDisabled : true,
      captcha : true
    });
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
  }

  handleEmailChange(event) {
    let value = event.target.value;
    this.setState({email : value});
  }

  handleCaptchaChange(value) {
    User.requestPasswordReset(this.state.email, value).then(() => {
      this.props.changePage('EMAILVERIFICATION', { title : 'Password Reset', email : this.state.email });
    })
    .catch((errors) => {
      this.setState({
        errorMessage : errors[0].msg,
        shake : true,
        formDisabled : false
      });
      this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
    });
  }

  handleCaptchaExpired() {
    this.setState({
      errorMessage : 'Captcha expired, please try again.',
      captcha : false
    });
  }

  handleCaptchaErrored() {
    this.setState({
      errorMessage : 'Captcha errored, please try again.',
      captcha : false
    });
  }

  componentWillUnmount() {
    clearTimeout(this.shakeID);
  }

  render() {
    return (
      <div className="forgot-password">
        <img className="square" src={Square} />

        {this.state.captcha &&
          <div className="container">
            <ReCAPTCHA sitekey="6Ld4GMMUAAAAACeYZabYkfxujugsYQJ9fY-THCAt" theme="dark" onChange={this.handleCaptchaChange} onExpired={this.handleCaptchaExpired} onErrored={this.handleCaptchaErrored} />
          </div>
        }

        {!this.state.captcha &&
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
        }
      </div>
    )
  }
}

export default ForgotPassword;