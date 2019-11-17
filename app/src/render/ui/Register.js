import React from 'react';

import RegisterCSS from '../assets/style/register.css';
import Picture from '../assets/img/register.svg'; 
import Plus from '../assets/img/plus.png';
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';
import Reload from '../assets/img/spin.png';

import User from '../utils/User';
import { ReCaptcha } from 'react-recaptcha-v3';

const RECAPTCHA_SITE_KEY = '6LeTIcMUAAAAABRMBLlMwV0rk3EheTnLh9SHsyOy';

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username : '',
      email : '',
      password : '',
      confirmPassword : '',
      recaptchaToken: '',

      strength : 0,
      strengthColor : '',
      strengthText : '',

      errorMessage : '',
      shake : false,
      formDisabled : false,
      captcha : false
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.handleCaptchaChange = this.handleCaptchaChange.bind(this);
    this.handleShake = this.handleShake.bind(this);

    this.updateStrengthMeter = this.updateStrengthMeter.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    let password = event.target.password.value;

    if (this.state.confirmPassword === password || this.state.recaptchaToken != '') {
      User.createUser(this.state.username, this.state.email, this.state.password, this.state.recaptchaToken).then(() => {
        this.props.changePage('EMAILVERIFICATION', { email :  this.state.email});
      }).catch(errors => {
        this.setState({formDisabled : false, captcha : false});
        
        if (typeof errors === 'string' || errors[0]) {
          this.setState({
            errorMessage : (typeof errors === 'string' ? errors : errors[0].msg),
            shake : true
          });

          this.handleShake();
        }

        //--- Refresh token after use
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action : 'register' })
          .then((token) => this.handleCaptchaChange(token));
      });
    } else {
      this.setState({
        errorMessage : (this.state.confirmPassword === password ? 'Passwords do not match.' : 'Recaptcha failed, please try again.'),
        shake : true
      });
      
      this.handleShake();
    }
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
  }

  handleUsernameChange(event) {
    let value = event.target.value;
    this.setState({username : value});
  }

  handleEmailChange(event) {
    let value = event.target.value;
    this.setState({email : value});
  }

  handlePasswordChange(event) {
    let value = event.target.value;
    this.setState({password : value});
    this.updateStrengthMeter(value);
  }

  handleConfirmPasswordChange(event) {
    let value = event.target.value;
    this.setState({confirmPassword : value});
  }

  updateStrengthMeter(password) {
    let strongRegex = new RegExp("^(?=.{20,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
    let mediumRegex = new RegExp("^(?=.{15,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
    let enoughRegex = new RegExp("(?=.{5,}).*", "g");

    let enough = enoughRegex.test(password);
    let medium = mediumRegex.test(password);
    let strong = strongRegex.test(password);

    switch (true) {
      case password == "":
        this.setState({
          strength : 0,
          strengthColor : "#C62828",
          strengthText : "Very Weak"
        });
        break;
      case (!enough):
        this.setState({
          strength : 0.15,
          strengthColor : "#C62828",
          strengthText : "Very Weak"
        });
        break;
      case strong:
        this.setState({
          strength : 1,
          strengthColor : "#2E7D32",
          strengthText : "Very Strong"
        });
        break;
      case medium:
          this.setState({
            strength : 0.65,
            strengthColor : "#9E9D24",
            strengthText : "Strong"
          });
        break;  
      default:
        this.setState({
          strength : 0.35,
          strengthColor : "#FF8F00",
          strengthText : "Fair"
        });  
    };
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
      <div className="register">
        <img className="square" src={Square} />

        <ReCaptcha
          sitekey={RECAPTCHA_SITE_KEY}
          action='register'
          verifyCallback={this.handleCaptchaChange}
        />

        <div className="left">
          <img src={Picture} />
        </div>

        <div className="right">
          <div className="container">
            <div className="header">
              <h3>Howdy!</h3>
              <small>Please enter your credentials to register.</small>
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
                <label>Username</label>
                <input type="text" title="Enter your username" required name="username" value={this.state.username} onChange={this.handleUsernameChange} />
              </div>

              <div className="group">
                <label>Email</label>
                <input type="text" title="Enter your email" required name="email" value={this.state.email} onChange={this.handleEmailChange} />
              </div>

              <div className="group">
                <label>Password</label>
                <input type="password" title="Enter your password" required name="password" value={this.state.password} onChange={this.handlePasswordChange} />
                
                {this.state.strength > 0 &&
                  <div className="progress">
                    <div className="inner" style={{ background : this.state.strengthColor, width : `${this.state.strength * 100}%` }}></div>
                  </div>
                }

                {this.state.strength > 0 &&
                  <small style={{ color : this.state.strengthColor }}>{this.state.strengthText}</small>
                }
              </div>

              <div className="group">
                <label>Confirm Password</label>
                <input type="password" title="Confirm your password" required name="confirmpassword" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange} />
              </div>

              <div className="link">
                <small onClick={this.handleLogin}>Already have an account?</small>
              </div>

              <div className={'submit ' + (this.state.shake ? 'shake' : '')}>
              <input type="submit" value="SIGN UP" disabled={this.state.formDisabled} />

              <div className="caption">
                <img className={(this.state.formDisabled ? 'spinning' : '')} src={(this.state.formDisabled ? Reload : Plus)} />
              </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Register;