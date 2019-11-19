import React from 'react';

import UserbarCSS from '../assets/style/userbar.css';
import Search from '../assets/img/search.png';
import Add from '../assets/img/add.png';
import Close from '../assets/img/close.png';
import Notification from '../assets/img/notification.png';
import TemplateProfile from '../assets/img/template-profile.png';

class Userbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focus : false,
      search : ''
    };

    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleInputFocus() {
    this.setState({focus : true});
  }

  handleInputBlur() {
    this.setState({focus : false});
  }

  handleSearchInput(event) {
    this.setState({search : event.target.value});
  }

  handleDelete() {
    this.setState({search : ''});
  }

  render() {
    return (
      <div className="userbar">
        <div className="search">
          <input type="text" value={this.state.search} onFocus={this.handleInputFocus} onBlur={this.handleInputBlur} onChange={this.handleSearchInput} />
          <img className={'glass ' + (!this.state.focus ? 'blur' : '')} src={Search} />
          
          {this.state.search != '' &&
            <img className={'delete ' + (!this.state.focus ? 'blur' : '')} src={Close} onClick={this.handleDelete} />
          }
        </div>

        <div className="controls">
          <div className="box">
            <img src={Add} />
          </div>

          <div className="box">
            <img src={Notification} />
          </div>

          <div className="box">
            <div className="dropdown">
              <img className="profile-pic" src={TemplateProfile} />

              <div className="dropdown-content">
                <div className="tabs">
                  <div className="tab">
                    Account
                  </div>

                  <div className="tab" onClick={this.props.logout}>
                    Logout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Userbar;