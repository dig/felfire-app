import React from 'react';

import RegisterCSS from '../assets/style/register.css';
import Picture from '../assets/img/register.svg'; 
import Plus from '../assets/img/plus.png';
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';

import User from '../utils/User';

const registerErrorParam = {
  USERNAME: 'username',
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRMPASSWORD: 'confirmPassword'
};

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password : '',
      confirmPassword : '',

      strength : 0,
      strengthColor : '',
      strengthText : '',

      errorMessage : '',
      shake : false
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.updateStrengthMeter = this.updateStrengthMeter.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    let email = event.target.email.value;
    let password = event.target.password.value;

    if (this.state.confirmPassword === password) {
      User.createUser(event.target.username.value, event.target.email.value, password).then(() => {
        this.props.changePage('EMAILVERIFICATION', { email :  email});
      }).catch(errors => {
        if (errors[0] && registerErrorParam[errors[0].param.toUpperCase()]) {
          this.setState({
            errorMessage : errors[0].msg,
            shake : true
          });
          this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
        }
      });
    } else {
      this.setState({
        errorMessage : 'Passwords do not match.',
        shake : true
      });
      this.shakeID = setTimeout(() => this.setState({shake : false}), 900);
    }
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
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
                <input type="text" title="Enter your username" required name="username"></input>
              </div>

              <div className="group">
                <label>Email</label>
                <input type="text" title="Enter your email" required name="email"></input>
              </div>

              <div className="group">
                <label>Password</label>
                <input type="password" title="Enter your password" required name="password" value={this.state.password} onChange={this.handlePasswordChange}></input>
                
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
                <input type="password" title="Confirm your password" required name="confirmpassword" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange}></input>
              </div>

              <div className="link">
                <small onClick={this.handleLogin}>Already have an account?</small>
              </div>

              <div className={'submit ' + (this.state.shake ? 'shake' : '')}>
               <input type="submit" value="SIGN UP" />

               <div className="caption">
                 <img src={Plus} />
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