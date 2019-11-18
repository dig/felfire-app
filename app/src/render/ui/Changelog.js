import React from 'react';

import ChangelogCSS from '../assets/style/changelog.css';
import ArrowRight from '../assets/img/arrow-right.png'; 

class Changelog extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.props.setChangelogOverlay(false);
  }

  render() {
    return (
      <div className="changelog">
        <div className="background"></div>

        <div className="container slideInDown">
          <div className="tool" onClick={this.handleClose}>
            <svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>
          </div>

          <div className="button">
            <input type="submit" value="NEXT" />

            <div className="caption">
              <img src={ArrowRight} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Changelog;