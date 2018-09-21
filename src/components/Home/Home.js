import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Annotator, { DeviceImagePicker } from '../Annotator/Annotator';
import car from '../../images/car.jpg';
import photo from '../../images/photo.JPG';
import './Home.css';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      openDeviceImagePicker: false,
      image: car,
      annotation: null,
      viewOnly: false
    };
  }

  onCancelAnnotator = () => {
    this.setState({
      open: false,
      image: car
    });
  };

  onCancelDeviceImagePicker = () => {
    this.setState({ openDeviceImagePicker: false });
  };

  onDoneAnnotator = annotation => {
    const newState = {
      open: false,
      image: photo
    };

    if (annotation) {
      console.log(annotation);
      newState.annotation = annotation;
    }

    this.setState(newState);
  };

  onDoneDeviceImagePicker = image => {
    this.setState({
      openDeviceImagePicker: false,
      open: true,
      viewOnly: false,
      image
    });
  };

  openAnnotator = () => {
    this.setState({
      open: true,
      viewOnly: false
    });
  };

  openViewOnlyAnnotator = () => {
    this.setState({
      open: true,
      viewOnly: true,
      image: this.state.annotation
        ? this.state.annotation.src
        : this.state.image
    });
  };

  openDeviceImagePicker = () => {
    this.setState({
      openDeviceImagePicker: true
    });
  };

  render() {
    return (
      <div className="Home">
        <div className="btn-container">
          <button onClick={this.openAnnotator}>Annotate</button>
          <br />
          <button onClick={this.openViewOnlyAnnotator}>Image Only</button>
          <br />
          <button onClick={this.openDeviceImagePicker}>
            From Camera/Gallery
          </button>
        </div>
        <Annotator
          isOpen={this.state.open}
          image={this.state.image}
          onCancel={this.onCancelAnnotator}
          onDone={this.onDoneAnnotator}
          viewOnly={this.state.viewOnly}
        />
        <DeviceImagePicker
          isOpen={this.state.openDeviceImagePicker}
          onCancel={this.onCancelDeviceImagePicker}
          onDone={this.onDoneDeviceImagePicker}
        />
        {this.state.annotation && (
          <div className="annotated-image">
            <p>
              <b>Annotated Image Preview:</b>
            </p>
            <img src={this.state.annotation.src} alt="annotated" />
            <p>{this.state.annotation.text}</p>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Home);
