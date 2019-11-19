import React from 'react';

import Navbar from '../components/Navbar';
import Userbar from '../components/Userbar';

class Library extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{height : '100%', width : '100%', display : 'flex'}}>
        <Navbar />
        <Userbar logout={this.props.logout} />
      </div>
    )
  }
}

export default Library;