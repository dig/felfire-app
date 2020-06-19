import React from 'react';

import LoadCSS from '../../assets/style/load.css';
import Icon from '../../assets/img/icon.png'; 

class Load extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let grayscale = 1 - this.props.overlayData.percent;

    return (
      <div className="loading">
        <img style={{
          filter: `grayscale(${grayscale})`
        }} src={Icon} />

        <div className="progress">
          <div className="inner" style={{ width : `${this.props.overlayData.percent * 100}%` }}></div>
        </div>
      </div>
    )
  }
}

export default Load;