import React from 'react';

import ForgotPasswordCSS from '../assets/style/forgotpassword.css';
import Tick from '../assets/img/done-tick.png'; 
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';
import Reload from '../assets/img/spin.png';

import User from '../utils/User';
import CaptchaSlider from '../components/CaptchaSlider';

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

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.captcha != '') {
      User.requestPasswordReset(this.state.email, this.state.captcha).then(() => {
        this.props.changePage('EMAILVERIFICATION', { title : 'Password Reset', email : this.state.email });
      })
      .catch((errors) => {
        this.setState({
          errorMessage : (typeof errors === 'string' ? errors : errors[0].msg),
          shake : true,
          formDisabled : false
        });

        this.handleShake();
      });
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
    this.props.changePage('LOGIN');
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