import React from 'react';
import Icon from '../assets/img/icon.png'; 

class Load extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      percent : 0
    };
  }

  render() {
    let grayscale = 1 - this.props.percent;

    return (
      <div className="loading">
        <img style={{
          filter: `grayscale(${grayscale})`
        }} src={Icon} />

        <div className="progress">
          <div className="inner" style={{ width : `${this.props.percent * 100}%` }}></div>
        </div>
      </div>
    )
  }
}

export default Load;