import React from 'react';

import PictureCSS from '../../assets/style/picture.css';

class Picture extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageUrl : this.props.overlayData.imageUrl
    };

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.props.setOverlay(false);
  }
  
  render() {
    return (
      <div className="picture">
        <div className="background" onClick={this.handleClose}></div>
        <img src={this.state.imageUrl} />
      </div>
    )
  }
}

export default Picture;