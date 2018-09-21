import React, { Component } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import BodyEnd from './BodyEnd';
import photo from './assets/photo.JPG';
import './css/DeviceImagePicker.css';

class DeviceImagePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.transitionTimeout = {
      enter: 400,
      exit: 400
    };
  }

  componentDidMount() {
    if (this.props.isOpen) {
      this.open();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen === true && this.props.isOpen !== prevProps.isOpen) {
      this.open();
    } else if (
      this.props.isOpen === false &&
      this.props.isOpen !== prevProps.isOpen
    ) {
      this.close();
    }
  }

  onClickOptionBtn = fromCamera => {
    this.getPicture(fromCamera);
  };

  getPicture = fromCamera => {
    if (window.navigator.camera) {
      window.navigator.camera.getPicture(
        imageURI => {
          this.props.onDone(imageURI);
        },
        err => {
          console.log('Error: ', err);
          this.props.onCancel();
        },
        {
          sourceType: fromCamera
            ? window.Camera.PictureSourceType.CAMERA
            : window.Camera.PictureSourceType.PHOTOLIBRARY,
          quality: 75,
          saveToPhotoAlbum: fromCamera,
          destinationType: window.Camera.DestinationType.FILE_URI,
          encodingType: window.Camera.EncodingType.JPEG,
          targetWidth: window.innerWidth * 2,
          targetHeight: (window.innerHeight - 90) * 2
        }
      );
    } else {
      this.props.onDone(photo);
    }
  };

  open = () => {
    if (!this.bodyClassAdded) {
      document.body.classList.add('device-image-picker-open');
      this.bodyClassAdded = true;
    }

    setTimeout(() => {
      this.setState({ open: true });
    }, 0);
  };

  close = () => {
    this.setState({ open: false });

    setTimeout(() => {
      if (this.bodyClassAdded) {
        document.body.classList.remove('device-image-picker-open');
        this.bodyClassAdded = false;
      }
    }, this.transitionTimeout.exit);
  };

  render() {
    return (
      <BodyEnd>
        {this.props.isOpen && (
          <div className="DeviceImagePicker">
            <TransitionGroup>
              {this.state.open && (
                <CSSTransition
                  timeout={this.transitionTimeout}
                  classNames="deviceImagePickerSlide"
                >
                  <div className="device-image-picker-container">
                    <div className="device-picker-options">
                      <button
                        className="from-camera"
                        onClick={() => this.onClickOptionBtn(true)}
                      >
                        From Camera
                      </button>
                      <button
                        className="from-photos"
                        onClick={() => this.onClickOptionBtn(false)}
                      >
                        From Photos
                      </button>
                    </div>
                    <button
                      className="device-picker-cancel"
                      onClick={this.props.onCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </CSSTransition>
              )}
            </TransitionGroup>
          </div>
        )}
      </BodyEnd>
    );
  }
}

DeviceImagePicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired
};

export default DeviceImagePicker;
