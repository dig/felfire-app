import React from 'react';

class Library extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    this.props.updateRefreshToken('')
      .then(() => this.props.changePage('LOGIN'));
  }

  render() {
    return (
      <div>
        <h3>Library - TODO</h3>
        <button onClick={this.handleLogout}>Logout</button>
      </div>
    )
  }
}

export default Library;