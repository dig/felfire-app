import React from 'react';

import Mail from '../assets/img/mail.png'; 
import LeftArrow from '../assets/img/left-arrow.png'; 

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
    this.props.changePage('LOGIN');
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
      <div className="main-form">
        <div className="container">
          <div className="header">
            <img className="bounceInDown" style={{ width: '60px' }} src={Mail} />

            <h2>{this.props.pageData.title || 'Email Verification'}</h2>
            <p>An email has been sent to '<b>{this.props.pageData.email}</b>'.</p>
            <p>Please check your inbox.</p>

            {(this.state.arrow) &&
              <img className={this.state.arrowWobble ? 'beat' : ''} style={{ width: '25px', marginTop: '7px', cursor: 'pointer' }} src={LeftArrow} onClick={this.handleLogin} />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default EmailVerification;