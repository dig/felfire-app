const moment = require('moment');

import React from 'react';

import LibraryCSS from '../assets/style/library.css';
import Navbar from '../components/Navbar';
import Userbar from '../components/Userbar';

import Box from '../assets/img/box.png';
import BackArrow from '../assets/img/back-arrow.png';

const IMAGE_HEIGHT_PX = 140;
const IMAGE_WIDTH_PX = 140;

class Library extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      images : [],
      categories : []
    };
    
    this.refreshCategories = this.refreshCategories.bind(this);
  }

  getUserImages(month) {
    
  }

  refreshCategories() {
    let categories = [];
    this.state.images.map((value, index) => {
      let created = moment(value.created);
      let monthYear = `${created.format('MMMM')} ${created.format('YYYY')}`;
      if (!categories.includes(monthYear)) categories.push(monthYear);
    });

    this.setState({categories : categories});
  }

  componentDidMount() {
    this.refreshCategories();
  }

  render() {
    return (
      <div style={{height : '100%', width : '100%', display : 'flex'}}>
        <Navbar />
        <Userbar logout={this.props.logout} />

        <div className="library">
          {this.state.images.length <= 0 &&
            <div className="empty">
              <img className="arrow" src={BackArrow} />
              <img src={Box} />
              <h3>EMPTY</h3>
              <p>Upload or take a screenshot</p>
              <p>to get started</p>
            </div>
          }

          {this.state.images.length > 0 &&
            <div className="rows">
              {this.state.categories.map((value, index) => {
                return <div key={index} className="row">
                  <small>{value}</small>
  
                  <div className="grid">
                    {this.state.images.map((image, imageIndex) => {
                      let created = moment(image.created);
                      let monthYear = `${created.format('MMMM')} ${created.format('YYYY')}`;

                      if (value == monthYear) 
                        return <div key={imageIndex} className="cell" style={{height : `${IMAGE_HEIGHT_PX}px`, width : `${IMAGE_WIDTH_PX}px`}}></div>
                    })}
                  </div>
                </div>
              })}
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Library;