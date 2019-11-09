const { ipcRenderer } = require('electron');

import React from 'react';
import Main from '../assets/style/main.scss';

import Library from '../ui/Library';
import Load from '../ui/Load';
import Login from '../ui/Login';

import Toolbar from './Toolbar';

const page = {
  LOGIN: Login,
  LIBRARY: Library
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      loaded : false,
      page : page.LIBRARY
    };

    ipcRenderer.on('change-page', (event, pageName) => this.setState({ page : page[pageName] }));
  }

  render() {
    let Page = this.state.page;

    if (this.state.loaded || this.state.page === page.LOGIN) {
      let background = (this.state.loaded ? 'on' : '');
    
      return (
        <div className="app">
          <Toolbar background={background} />
          <div className="page">
            <Page />
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