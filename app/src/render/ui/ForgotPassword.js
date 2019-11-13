import React from 'react';

import ForgotPasswordCSS from '../assets/style/forgotpassword.css';
import Mail from '../assets/img/mail.png';
import Square from '../assets/img/square.png';
import Mark from '../assets/img/danger.png';

import User from '../utils/User';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error : ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    let email = event.target.email.value;

    User.requestPasswordReset(email).then(() => {
      this.props.changePage('EMAILVERIFICATION', { title : 'Password Reset', email : email });
    })
    .catch((errors) => this.setState({error : errors[0].msg}));
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage('LOGIN');
  }

  render() {
    return (
      <div className="forgotpassword">
        <img className="square" src={Square} />

        <div className="container">
          <div className="header">
            <h3>Need help?</h3>
            <small>Please enter your email to recover your account.</small>
          </div>

          <form className="content" onSubmit={this.handleSubmit}>
            {this.state.error != '' &&
              <div className="error">
                <div className="content">
                  <img src={Mark} />
                  {this.state.error}
                </div>
              </div>
            }

            <div className="group">
              <input type="text" title="Enter your email" required name="email"></input>
            </div>

            <div className="link">
              <small onClick={this.handleLogin}>Remembered your password?</small>
            </div>

            <div className="submit">
              <input type="submit" value="RECOVER" />

              <div className="caption">
                <img src={Mail} />
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default ForgotPassword;