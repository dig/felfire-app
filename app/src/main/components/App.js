import React from 'react';

import Library from '../ui/Library';
import Load from '../ui/Load';

const page = {
  LIBRARY: <Library />
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      loaded : false,
      page : page.LIBRARY
    };
  }

  render() {
    return (this.state.loaded ? this.state.page : <Load />);
  }
}

export default App;