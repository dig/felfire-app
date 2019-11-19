import React from 'react';

import NavbarCSS from '../assets/style/navbar.css';

import Home from '../assets/img/home.png';
import Editor from '../assets/img/editor.png';
import Settings from '../assets/img/settings.png';

class Navbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="navbar">
        <div className="tabs">
          <div className="tab selected">
            <div className="border"></div>

            <div className="icon">
              <img src={Home} />
            </div>

            <div className="text">
              Library
            </div>
          </div>

          <div className="tab">
            <div className="border"></div>

            <div className="icon">
             <img src={Editor} />
            </div>
            
            <div className="text">
              Editor
            </div>
          </div>

          <div className="tab">
            <div className="border"></div>

            <div className="icon">
              <img src={Settings} />
            </div>
            
            <div className="text">
              Settings
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Navbar;