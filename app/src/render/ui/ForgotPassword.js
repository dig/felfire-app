import React from 'react';
import User from '../utils/User';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error : false
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
    .catch(() => this.setState({error : true}));
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
              <input type="text" placeholder="Enter email" title="Enter your email" required name="email"></input>

              {this.state.error &&
                <small>Email doesn't exist.</small>
              }
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