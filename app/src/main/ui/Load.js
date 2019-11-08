import React from 'react';
import Icon from '../assets/img/icon.png'; 

class Load extends React.Component {
  constructor() {
    super();

    this.state = {
      grayscale : 1
    };
  }

  render() {
    return (
      <div class="loading">
        <img style={{
          filter: `grayscale(${this.state.grayscale})`
        }} src={Icon} />
      </div>
    )
  }
}

export default Load;