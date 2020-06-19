import React from 'react';

import EmailVerificationCSS from '../../assets/style/emailverification.css';
import Mail from '../../assets/img/mail.png'; 
import Tick from '../../assets/img/done-tick.png';

import { PAGES } from '../../constants/app.constants';

class EmailVerification extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      arrow : true,
      arrowWobble : false
    };

    this.handleLogin = this.handleLogin.bind(this);
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.changePage(PAGES.LOGIN);
  }

  componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState({arrowWobble : true});
      this.timeoutID = setTimeout(() => this.setState({arrowWobble : false}), 500);
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    clearTimeout(this.timeoutID);
  }

  render() {
    return (
      <div className="email-verification slideInDown">
        <div className="container">
          <div className="title">
            <img src={Mail} />
            {this.props.pageData.title || 'Email Verification'}
          </div>

          <div className="body">
            An email has been sent to <b>{this.props.pageData.email}</b><br />Please check your inbox to complete the account registration process.
          </div>

          <div className="submit">
            <input type="submit" value="Done" onClick={this.handleLogin} />

            <div className="caption">
              <img src={Tick} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EmailVerification;