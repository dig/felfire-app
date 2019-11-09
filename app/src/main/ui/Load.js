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
    ipcRenderer.on('load-setup', (event, isFirstTime) => {
      let intervalId = setInterval(() => {
        let nextPct = Math.min(1, (this.state.percent + 0.02));
        this.setState({ percent : nextPct });

        if (nextPct >= 1) {
          clearInterval(this.state.intervalId);
        }
      }, 100);

      this.setState({ intervalId : intervalId });
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