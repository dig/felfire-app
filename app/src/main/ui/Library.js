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
      <h1>Library</h1>
    )
  }
}

export default Library;