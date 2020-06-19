const { ipcRenderer, remote } = require('electron'),
      authService = remote.require('./common/services/auth.service');

import React from 'react';

import UserbarCSS from '../assets/style/userbar.css';
import Search from '../assets/img/search.png';
import Add from '../assets/img/add.png';
import Close from '../assets/img/close.png';
import Notification from '../assets/img/notification.png';
import TemplateProfile from '../assets/img/template-profile.png';

import { PAGES, OVERLAY } from '../constants/app.constants';

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
    this.handleSearchDelete = this.handleSearchDelete.bind(this);
    this.handleCapture = this.handleCapture.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
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

  handleSearchDelete() {
    this.setState({search : ''});
  }

  handleCapture() {
    this.props.setOverlay(true, OVERLAY.CAPTURE);
  }

  handleLogout() {
    authService.logout();
    ipcRenderer.send('logout');
    this.props.changePage(PAGES.LOGIN);
  }

  render() {
    return (
      <div className="userbar">
        <div className="search">
          <input type="text" value={this.state.search} onFocus={this.handleInputFocus} onBlur={this.handleInputBlur} onChange={this.handleSearchInput} />
          <img className={'glass ' + (!this.state.focus ? 'blur' : '')} src={Search} />
          
          {this.state.search != '' &&
            <img className={'delete ' + (!this.state.focus ? 'blur' : '')} src={Close} onClick={this.handleSearchDelete} />
          }
        </div>

        <div className="controls">
          <div className="box" onClick={this.handleCapture}>
            <img src={Add} onClick={this.handleCapture} />
          </div>

          <div className="box">
            <img src={Notification} />
          </div>

          <div className="box">
            <div className="profile-dropdown">
              <img className="profile-pic" src={TemplateProfile} />

              <div className="dropdown-content">
                <div className="tabs">
                  <div className="tab">
                    Account
                  </div>

                  <div className="tab" onClick={this.handleLogout}>
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