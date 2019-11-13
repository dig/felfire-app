const { ipcRenderer } = require('electron');

import React from 'react';
import ToolbarCSS from '../assets/style/toolbar.css';

import Icon from '../assets/img/icon.png'; 
import Text from '../assets/img/text.png'; 

class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.handleMinimize = this.handleMinimize.bind(this);
    this.handleMaximize = this.handleMaximize.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleMinimize(event) {
    event.preventDefault();
    ipcRenderer.send('toolbar-minimize', {});
  }

  handleMaximize(event) {
    event.preventDefault();
    ipcRenderer.send('toolbar-maximize', {});
  }

  handleClose(event) {
    event.preventDefault();
    ipcRenderer.send('toolbar-close', {});
  }

  render() {
    return (
      <div className={"toolbar noselect " + (this.props.background == "on" ? 'background' : '')}>
        <div className="drag">
          <img className="icon" src={Icon} />
          <img className="text" src={Text} />
        </div>

        <div className="toolset">
          <div className="tool" onClick={this.handleMinimize}>
           <svg x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg>
          </div>

          <div className="tool" onClick={this.handleMaximize}>
            <svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" /></svg>
          </div>
          
          <div className="tool close" onClick={this.handleClose}>
            <svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>
          </div>
        </div>
      </div>
    )
  }
}

export default Toolbar;