const { ipcRenderer } = require('electron');

import React from 'react';

class Library extends React.Component {
  constructor() {
    super();
    ipcRenderer.on('library-receive', (event, data) => {
      console.log(data);
    });
  }

  render() {
    return (
      <h3>Library - TODO</h3>
    )
  }
}

export default Library;