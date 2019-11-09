const { ipcRenderer } = require('electron');

import React from 'react';

const WAIT_INTERVAL = 500;

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password : '',
      confirmPassword : '',

      strength : 0,
      strengthColor : '',
      strengthText : ''
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.updateStrengthMeter = this.updateStrengthMeter.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
  }

  handlePasswordChange(event) {
    let value = event.target.value;
    this.setState({password : value});
    this.updateStrengthMeter(value);
    
    // clearTimeout(this.timer);
    // this.timer = setTimeout(this.updateStrengthMeter, WAIT_INTERVAL);
  }

  handleConfirmPasswordChange(event) {
    let value = event.target.value;
    this.setState({confirmPassword : value});
  }

  updateStrengthMeter(password) {
    let strongRegex = new RegExp("^(?=.{20,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
    let mediumRegex = new RegExp("^(?=.{15,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
    let enoughRegex = new RegExp("(?=.{10,}).*", "g");

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

  render() {
    return (
      <div className="main-form animated slideInDown">
        <div className="container">
          <div className="header">
            <h2>Register</h2>
            <small>Please enter your credentials to register</small>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="group">
              <label>Username</label>
              <input type="text" placeholder="Enter username" title="Enter a username" required name="username" maxLength="16" />
            </div>

            <div className="group">
              <label>Email</label>
              <input type="text" placeholder="Enter email" title="Enter your email" required name="email" maxLength="48" />
            </div>

            <div className="group">
              <label>Password</label>
              <input type="password" placeholder="Enter password" title="Enter your password" required name="password" maxLength="60" value={this.state.password} onChange={this.handlePasswordChange} />

              {this.state.strength > 0 &&
                <div className="progress">
                  <div className="inner" style={{ background : this.state.strengthColor, width : `${this.state.strength * 100}%` }}></div>
                </div>
              }

              {this.state.strength > 0 &&
                <span className="meter-text" style={{ color : this.state.strengthColor }}>{this.state.strengthText}</span>
              }
            </div>

            <div className="group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Enter password" title="Enter your password" required name="confirm-password" maxLength="60" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange} />
              
              {(this.state.confirmPassword != "" && this.state.password != this.state.confirmPassword) &&
                <small>Passwords do not match.</small>
              }
            </div>

            <div className="group">
             <input type="submit" value="Sign Up"></input>
            </div>

            <small onClick={this.handleLogin}>Have an account?</small>
          </form>
        </div>
      </div>
    )
  }
}

export default Register;