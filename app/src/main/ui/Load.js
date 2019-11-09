const { ipcRenderer } = require('electron');

import React from 'react';
import Icon from '../assets/img/icon.png'; 

class Load extends React.Component {
  constructor() {
    super();

    this.state = {
      percent : 0
    };

    ipcRenderer.on('load-state', (event, percent) => {
      this.setState({ percent : percent });
    });
    ipcRenderer.send('load-init', {});
  }

  render() {
    let grayscale = 1 - this.state.percent;

    return (
      <div className="loading">
        <img style={{
          filter: `grayscale(${grayscale})`
        }} src={Icon} />

        <div className="progress">
          <div className="inner" style={{ width : `${this.state.percent * 100}%` }}></div>
        </div>
      </div>
    )
  }
}

export default Load;