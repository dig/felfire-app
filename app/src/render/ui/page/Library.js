const { remote } = require('electron'),
      userService = remote.require('./common/services/user.service'),
      moment = require('moment');

import React from 'react';

import LibraryCSS from '../../assets/style/library.css';
import Navbar from '../../components/Navbar';
import Userbar from '../../components/Userbar';

import Box from '../../assets/img/box.png';
import BackArrow from '../../assets/img/back-arrow.png';

import { OVERLAY } from '../../constants/app.constants';
import { IMAGE_HEIGHT_PX, IMAGE_WIDTH_PX, IMAGE_FETCH_AMOUNT } from '../../constants/library.constants';

class Library extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      images : [],
      categories : [],
      page : 0
    };
    
    this.getImages = this.getImages.bind(this);
    this.getNextImages = this.getNextImages.bind(this);
    this.refresh = this.refresh.bind(this);
    this.refreshCategories = this.refreshCategories.bind(this);
    this.handleImageClick = this.handleImageClick.bind(this);
  }

  async getImages(page, cache = true) {
    try {
      let images = await userService.fetchImages(page, IMAGE_FETCH_AMOUNT, cache);
      this.setState({images : images, page : page}, () => this.refreshCategories());
    } catch (err) {
      console.log(err);
    }
  }

  getNextImages() {
    this.getImages(this.state.page + 1);
  }

  refresh() {
    this.getImages(1);
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

  handleImageClick(url) {
    this.props.setOverlay(true, OVERLAY.PICTURE, {
      imageUrl : url
    });
  }

  componentDidMount() {
    if (this.state.page <= 0) this.getNextImages();
  }

  render() {
    return (
      <div style={{height : '100%', width : '100%', display : 'flex'}}>
        <Navbar />
        <Userbar changePage={this.props.changePage} setOverlay={this.props.setOverlay} />

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
                        return <div key={imageIndex} className="cell" style={{height : `${IMAGE_HEIGHT_PX}px`, width : `${IMAGE_WIDTH_PX}px`}} onClick={() => this.handleImageClick(image.cdn_url)} >
                          <img className="thumbnail" src={(image.thumb_url ? image.thumb_url : image.cdn_url)} onClick={() => this.handleImageClick(image.cdn_url)} />
                        </div>
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