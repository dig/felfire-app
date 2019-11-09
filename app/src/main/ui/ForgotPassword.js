const { ipcRenderer } = require('electron');

import React from 'react';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
  }

  render() {
    return (
      <div className="main-form animated slideInDown">
        <div className="container">
          <div className="header">
            <h2>Forgotten Password</h2>
            <small>Please enter your email to recover your account</small>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="group">
              <label>Email</label>
              <input type="text" placeholder="Enter email" title="Enter your email" required name="email"></input>
            </div>

            <div className="group">
             <input type="submit" value="Recover"></input>
            </div>

            <small onClick={this.handleLogin}>Remember your password?</small>
          </form>
        </div>
      </div>
    )
  }
}

export default ForgotPassword;