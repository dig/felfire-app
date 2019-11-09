const { ipcRenderer } = require('electron');

import React from 'react';
import Main from '../assets/style/main.scss';

import ForgotPassword from '../ui/ForgotPassword';
import Library from '../ui/Library';
import Load from '../ui/Load';
import Login from '../ui/Login';
import Register from '../ui/Register';

import Toolbar from './Toolbar';

const pages = {
  LOGIN: Login,
  REGISTER: Register,
  FORGOTPASSWORD: ForgotPassword,
  LIBRARY: Library
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      loaded : false,
      page : pages.LIBRARY
    };

    ipcRenderer.on('change-page', (event, pageName) => this.changePage(pageName));
    this.changePage = this.changePage.bind(this);
  }

  changePage(pageName) {
    this.setState({page : pages[pageName]});
  }

  render() {
    let Page = this.state.page;

    if (this.state.loaded || this.state.page === pages.LOGIN || this.state.page === pages.REGISTER || this.state.page === pages.FORGOTPASSWORD) {
      let background = (this.state.loaded ? 'on' : '');
    
      return (
        <div className="app">
          <Toolbar background={background} />
          <div className="page">
            <Page changePage={this.changePage} />
          </div>
        </div>
      );
    }

    return (
      <div className="app">
        <Toolbar background="" />
        <div className="page">
          <Load />
        </div>
      </div>
    );
  }
}

export default App;