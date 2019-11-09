const { ipcRenderer } = require('electron');

import React from 'react';

class Login extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <div className="login">
        <div className="container">
          <div className="header">
            <h3>Login</h3>
            <small>Please enter your credentials to login.</small>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="group">
              <label>Email</label>
              <input type="text" placeholder="Enter email" title="Enter your email" required name="email"></input>
            </div>

            <div className="group">
              <label>Password</label>
              <input type="text" placeholder="Enter password" title="Enter your password" required name="password"></input>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default Login;