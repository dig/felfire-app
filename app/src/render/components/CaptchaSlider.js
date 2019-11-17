import React from 'react';

import ArrowRight from '../assets/img/arrow-right.png'; 
import Tick from '../assets/img/done-tick.png'; 

import AES from '../utils/AES';

class CaptchaSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      left : 0,
      drag : false,
      start : 0,
      solved : false,

      hovered : false,
      clicked : false
    };

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleSolved = this.handleSolved.bind(this);
    this.calculatePayload = this.calculatePayload.bind(this);

    this.slider = React.createRef();
  }

  handleValueChange(event) {
    let value = event.target.value;
    if (value > this.state.value) {
      this.setState({value : value});
    }
  }

  handleMouseDown() {
    this.setState({
      drag : true,
      clicked : true
    });

    if (this.state.start <= 0)
      this.setState({start : (new Date()).getTime()});
  }

  handleMouseUp() {
    this.setState({drag : false});
  }

  handleMouseLeave() {
    this.setState({drag : false});
  }

  handleMouseMove(event) {
    if (this.state.drag && event.movementX >= 1) {
      let newValue = this.state.left + 1.05;
      let maxValue = this.slider.current.offsetWidth - 34;

      this.setState({
        left : Math.min(newValue, maxValue),
        hovered : true
      });

      if (!this.state.solved && newValue >= maxValue) {
        this.setState({solved : true}, () => this.handleSolved());
      }
    }
  }

  handleSolved() {
    if (this.props.onComplete) {
      this.timeoutID = setTimeout(() => this.props.onComplete(this.calculatePayload()), 1500);
    }
  }

  calculatePayload() {
    let payload = {
      a : (new Date().getTime()) - this.state.start,
      b : (new Date()).getTime(),
      c : this.state.hovered,
      d : this.state.clicked
    };

    return AES.encrypt(JSON.stringify(payload));
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutID);
  }

  render() {
    return (
      <div ref={this.slider} className="captcha-slider noselect" onMouseLeave={this.handleMouseLeave}>
        <div className="thumb-area">
          <div className="thumb" style={{left : this.state.left}} onMouseLeave={this.handleMouseLeave} onMouseMove={this.handleMouseMove} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
            <img className={(this.state.solved ? 'rotate' : '')} src={(this.state.solved ? Tick : ArrowRight)} />
          </div>
        </div>
        <label>Slide to solve captcha</label>
      </div>
    )
  }
}

export default CaptchaSlider;