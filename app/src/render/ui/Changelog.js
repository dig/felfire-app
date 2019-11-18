import React from 'react';

import ChangelogCSS from '../assets/style/changelog.css';
import ArrowRight from '../assets/img/arrow-right.png'; 
import Close from '../assets/img/close.png'; 

import Captcha from '../assets/img/changelog/captcha.png'; 
import Form from '../assets/img/changelog/form.png'; 

const CHANGELOG_ENTRY = [
  {
    "image": Captcha,
    "title": "NEW CAPTCHA",
    "message": "New slide captcha is now in operation. We needed to upgrade the captcha process in order to prevent malicious bots abusing our systems."
  },
  {
    "image": Form,
    "title": "POLISHED FORMS",
    "message": "The main forms (login, register, forgot password) have been redesigned and completed. Next stop is the library!"
  }
];

class Changelog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index : 0
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
    this.changeEntry = this.changeEntry.bind(this);
  }

  handleClose() {
    this.props.setChangelogOverlay(false);
  }

  handleChange() {
    let newIndex = this.state.index + 1;
    this.changeEntry(Math.min(CHANGELOG_ENTRY.length - 1, newIndex));

    if (this.state.index == (CHANGELOG_ENTRY.length - 1))
      this.handleClose();
  }

  handleHeaderClick(index) {
    if (index != this.state.index)
      this.changeEntry(index);
  }

  changeEntry(index) {
    this.setState({index : index});
  }

  render() {
    let entry = CHANGELOG_ENTRY[this.state.index];

    return (
      <div className="changelog">
        <div className="background"></div>

        <div className="container slideInDown">
          <div className="tool" onClick={this.handleClose}>
            <svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>
          </div>

          <div className="header">
            {CHANGELOG_ENTRY.map((value, index) => {
              return <div key={index} className="outer" onClick={() => this.handleHeaderClick(index)}>
                <div className={'box ' + (this.state.index == index ? 'active' : '')}>
                </div>
              </div>
            })}
          </div>

          <div className="picture">
            <div className="circle"></div>
            <img src={entry.image} />
          </div>

          <div className="content">
            <h3>{entry.title || 'Error'}</h3>
            <p>{entry.message || 'Error'}</p>
          </div>

          <div className="button">
            <input type="submit" value={(this.state.index == (CHANGELOG_ENTRY.length - 1) ? 'Close' : 'Next')} onClick={this.handleChange} />

            <div className="caption">
              <img src={(this.state.index == (CHANGELOG_ENTRY.length - 1) ? Close : ArrowRight)} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Changelog;