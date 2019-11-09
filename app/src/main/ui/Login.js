const { ipcRenderer } = require('electron');

import React from 'react';

class Login extends React.Component {
  handleSubmit() {

  }

  render() {
    return (
      <div className="login container">
        <div className="header">
          <h3>Login</h3>
          <small>Please enter your credentials to login.</small>
        </div>
      </div>
    )
  }
}

export default Login;