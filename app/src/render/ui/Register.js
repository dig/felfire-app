import React from 'react';

import RegisterCSS from '../assets/style/register.css';
import Picture from '../assets/img/register.svg'; 
import Tick from '../assets/img/done-tick.png'; 
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';
import Reload from '../assets/img/spin.png';

import User from '../utils/User';
import CaptchaSlider from '../components/CaptchaSlider';

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username : '',
      email : '',
      password : '',
      confirmPassword : '',

      strength : 0,
      strengthColor : '',
      strengthText : '',

      errorMessage : '',
      shake : false,
      formDisabled : false,
      captcha : ''
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.handleShake = this.handleShake.bind(this);
    this.handleCaptchaComplete = this.handleCaptchaComplete.bind(this);

    this.updateStrengthMeter = this.updateStrengthMeter.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    let password = event.target.password.value;

    if (this.state.confirmPassword === password && this.state.captcha != '') {
      User.createUser(this.state.username, this.state.email, this.state.password, this.state.captcha).then(() => {
        this.props.changePage('EMAILVERIFICATION', { email :  this.state.email});
      }).catch(errors => {
        this.setState({formDisabled : false});
        
        if (typeof errors === 'string' || errors[0]) {
          this.setState({
            errorMessage : (typeof errors === 'string' ? errors : errors[0].msg),
            shake : true
          });

          this.handleShake();
        }
      });
    } else {
      this.setState({
        errorMessage : (this.state.captcha === '' ? 'Captcha failed, please try again.' : 'Passwords do not match.'),
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

  handleShake() {
    this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
  }

  handleCaptchaComplete(token) {
    this.setState({captcha : token});
  }

  componentWillUnmount() {
    clearTimeout(this.shakeID);
  }

  render() {
    return (
      <div className="register">
        <img className="square" src={Square} />

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
                <input type="password" title="Confirm your password 1" required name="confirmpassword" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange} />
              </div>

              {this.state.captcha === '' &&
                <div className="captcha">
                  <CaptchaSlider onComplete={this.handleCaptchaComplete} />
                </div>
              }

              {this.state.captcha != '' &&
                <div className={'submit ' + (this.state.shake ? 'shake' : '')}>
                  <input type="submit" value="SIGN UP" disabled={this.state.formDisabled} />

                  <div className="caption">
                    <img className={(this.state.formDisabled ? 'spinning' : '')} src={(this.state.formDisabled ? Reload : Tick)} />
                  </div>
                </div>
              }

              <div className="link">
                <div className="box" onClick={this.handleLogin}>
                  <small>Have an <b>account</b>?</small>
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