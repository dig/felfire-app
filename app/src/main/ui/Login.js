const { ipcRenderer } = require('electron');

import React from 'react';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleForgottenPassword = this.handleForgottenPassword.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    ipcRenderer.send('login', {
      email : event.target.email.value,
      password : event.target.password.value
    });
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
      <div className="main-form animated slideInDown">
        <div className="container">
          <div className="header">
            <h2>Login</h2>
            <small>Please enter your credentials to login</small>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="group">
              <label>Email</label>
              <input type="text" placeholder="Enter email" title="Enter your email" required name="email"></input>
            </div>

            <div className="group">
              <label>Password</label>
              <input type="password" placeholder="Enter password" title="Enter your password" required name="password" maxLength="60"></input>
            </div>

            <div className="group">
             <input type="submit" value="Sign In"></input>
            </div>

            <small onClick={this.handleRegister}>Don't have an account?</small>
            <small onClick={this.handleForgottenPassword}>Forgotten password?</small>
          </form>
        </div>
      </div>
    )
  }
}

export default Login;