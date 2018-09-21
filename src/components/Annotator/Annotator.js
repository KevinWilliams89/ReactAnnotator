import React, { Component } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import emojiStrip from 'emoji-strip';
import BodyEnd from './BodyEnd';
import DeviceImagePicker from './DeviceImagePicker';
import commentSvg from './assets/comment-alt-solid.svg';
import highlighterSvg from './assets/highlighter-solid.svg';
import penSvg from './assets/pen-solid.svg';
import redoSvg from './assets/redo-alt-solid.svg';
import trashSvg from './assets/trash-alt-solid.svg';
import undoSvg from './assets/undo-alt-solid.svg';
import './css/Annotator.css';

class Annotator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: ['pen'],
      showComment: false,
      comment: ''
    };

    this.setDefaults();
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
    } else if (this.props.isOpen === true && !this.props.viewOnly) {
      this.context = this.canvas.getContext('2d');
    }
  }

  onCommentChange = event => {
    this.setState({
      comment: emojiStrip(event.target.value)
    });
  };

  onClickFooterBtn = selected => {
    if (selected !== 'comment') {
      this.hideComment();
    }

    if (selected === 'pen' || selected === 'highlighter') {
      this.setState({
        selected: [selected]
      });
    } else if (selected === 'undo') {
      this.undo();
    } else if (selected === 'redo') {
      this.redo();
    } else if (selected === 'trash') {
      this.resetCanvas();
    } else if (selected === 'comment') {
      this.toggleComment();
    }
  };

  onClickDone = event => {
    event.preventDefault();
    if (this.props.viewOnly) {
      this.props.onDone(null);
    } else if (!this.isSaving) {
      this.isSaving = true;
      this.saveImage(event).then(annotation => {
        this.props.onDone(annotation);
      });
    }
  };

  setDefaults = () => {
    this.actions = [];
    this.stack = [];
    this.redoStack = [];
    this.isDrawing = false;
    this.isSaving = false;
    this.isSquarePhoto = false;
    this.orientation = '';
    this.originalImgDimensions = {};

    this.line = {
      width: 8,
      color: '#ff0000',
      end: 'butt'
    };

    this.transitionTimeout = {
      enter: 600,
      exit: 600
    };
  };

  /* 
   * Sets the dimensions of the canvas dependent on the window width/height
   * so that the image isn't stretched/squashed
   */
  setCanvasDimensions = () => {
    const maxWidth =
      this.orientation === 'landscape'
        ? window.innerHeight - 90
        : window.innerWidth; // Max width for the image
    const maxHeight =
      this.orientation === 'landscape'
        ? window.innerWidth
        : window.innerHeight - 90; // Max height for the image
    let ratio = 0; // Used for aspect ratio
    let { width, height } = this.baseImg; // Current image width and height

    // Check if the current width is larger than the max
    if (width > maxWidth) {
      ratio = maxWidth / width; // Get ratio for scaling image
      height *= ratio; // Reset height to match scaled image
      width *= ratio; // Reset width to match scaled image
    }

    // Check if current height is larger than max
    if (height > maxHeight) {
      ratio = maxHeight / height; // Get ratio for scaling image
      width *= ratio; // Reset width to match scaled image
      height *= ratio; // Reset height to match scaled image
    }

    // Set canvas width and height
    this.canvas.width = this.orientation === 'landscape' ? height : width;
    this.canvas.height = this.orientation === 'landscape' ? width : height;
  };

  getImageDimensionsToSave = () => {
    const maxWidth = 480;
    const maxHeight = 640;

    let ratio = 0; // Used for aspect ratio
    let width =
      this.orientation === 'landscape'
        ? this.originalImgDimensions.height
        : this.originalImgDimensions.width;
    let height =
      this.orientation === 'landscape'
        ? this.originalImgDimensions.width
        : this.originalImgDimensions.height;

    // Check if the current width is larger than the max
    if (width > maxWidth) {
      ratio = maxWidth / width; // Get ratio for scaling image
      height *= ratio; // Reset height to match scaled image
      width *= ratio; // Reset width to match scaled image
    }

    // Check if current height is larger than max
    if (height > maxHeight) {
      ratio = maxHeight / height; // Get ratio for scaling image
      width *= ratio; // Reset width to match scaled image
      height *= ratio; // Reset height to match scaled image
    }

    return { width, height };
  };

  setSelectedLine = () => {
    this.hideComment();
    if (this.state.selected.indexOf('highlighter') > -1) {
      // yellow highlighter selected
      this.context.strokeStyle = 'rgba(243, 243, 21, 0.1)';
      this.context.lineWidth = 15;
      this.context.lineCap = 'round';
    } else if (this.state.selected.indexOf('pen') > -1) {
      // red pen selected
      this.context.strokeStyle = this.line.color;
      this.context.lineWidth = this.line.width;
      this.context.lineCap = this.line.end;
    } else {
      // Drawing has started but no line is selected so work out which to use
      const blackColour = '#000000';
      const redColour = this.line.color;
      if (
        this.context.strokeStyle === blackColour ||
        this.context.strokeStyle === redColour
      ) {
        // use red pen
        this.context.strokeStyle = this.line.color;
        this.context.lineWidth = this.line.width;
        this.context.lineCap = this.line.end;
      } else {
        // Must previously have selected yellow highlighter so continue using yellow highlighter
        this.context.strokeStyle = 'rgba(243, 243, 21, 0.1)';
        this.context.lineWidth = 15;
        this.context.lineCap = 'round';
      }
    }
  };

  /*
   * Sets the x and y co-ordinate correction values so that the drawing lines
   * appear in the right place
   */
  setXYCoordsCorrection = () => {
    this.xTouchCorrection =
      (this.annotateContainer.clientWidth - this.canvas.width) / 2;
    this.yTouchCorrection =
      (this.annotateContainer.clientHeight - this.canvas.height) / 2;
  };

  getOrientation = () =>
    new Promise(resolve => {
      this.baseImg = new Image();
      this.baseImg.src = this.props.image;
      this.baseImg.onload = () => {
        if (this.baseImg.width > this.baseImg.height) {
          this.orientation = 'landscape';
        } else {
          this.orientation = 'portrait';
        }
        if (this.baseImg.width === this.baseImg.height) {
          this.isSquarePhoto = true;
        }

        this.originalImgDimensions = {
          width: this.baseImg.width,
          height: this.baseImg.height
        };

        resolve();
      };
    });

  getX = event => {
    if (event.type.indexOf('touchend') > -1) {
      return undefined;
    } else if (event.type.indexOf('touch') > -1) {
      return event.targetTouches[0].pageX - this.xTouchCorrection;
    }
    return event.layerX - this.xTouchCorrection;
  };

  getY = event => {
    if (event.type.indexOf('touchend') > -1) {
      return undefined;
    } else if (event.type.indexOf('touch') > -1) {
      return event.targetTouches[0].pageY - 45 - this.yTouchCorrection;
    }
    return event.layerY - this.yTouchCorrection;
  };

  open = () => {
    this.setDefaults();

    if (!this.props.viewOnly) {
      setTimeout(() => this.initCanvas(), 0);
    }

    if (!this.bodyClassAdded) {
      document.body.classList.add('annotator-open');
      this.bodyClassAdded = true;
    }
  };

  close = () => {
    setTimeout(() => {
      if (this.bodyClassAdded) {
        document.body.classList.remove('annotator-open');
        this.bodyClassAdded = false;
      }
    }, this.transitionTimeout.exit);
  };

  rotateImg = () =>
    new Promise(resolve => {
      // get the canvas element and its context
      const context = this.canvasRotate.getContext('2d');

      this.canvasRotate.width = window.innerWidth;
      this.canvasRotate.height = window.innerHeight - 90;

      const baseImg = new Image();
      baseImg.src = this.props.image;
      baseImg.onload = () => {
        // translate image at the top-right hand corner
        context.translate(this.canvasRotate.width, 0);
        // rotate 90 degrees around this point (radians)
        context.rotate(1.57079633);
        // as the image is landscape, image width = height of canvas, and image height = width of canvas
        context.drawImage(
          baseImg,
          0,
          0,
          this.canvasRotate.height,
          this.canvasRotate.width
        );
        // return the data URL
        resolve(this.canvasRotate.toDataURL('image/png'));
      };
    });

  initCanvas = () => {
    this.setState({
      selected: ['pen'],
      showComment: false,
      comment: ''
    });
    this.context = this.canvas.getContext('2d');

    this.getOrientation().then(() => {
      this.setCanvasDimensions();
      this.setXYCoordsCorrection();

      if (this.orientation === 'landscape') {
        this.rotateImg().then(strDataURI => {
          this.baseImg = new Image();
          this.baseImg.src = strDataURI;
          this.baseImg.onload = () => {
            this.context.drawImage(
              this.baseImg,
              0,
              0,
              this.canvas.width,
              this.canvas.height
            );
          };
        });
      } else {
        this.baseImg = new Image();
        this.baseImg.src = this.props.image;
        this.baseImg.onload = () => {
          this.context.drawImage(
            this.baseImg,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );
        };
      }
    });
  };

  touchstart = coors => {
    this.redoStack = [];
    this.actions = [];
    this.setSelectedLine();
    this.context.beginPath();
    this.context.moveTo(coors.x, coors.y);
    this.isDrawing = true;
    this.actions.push({
      context: this.context,
      coors,
      strokeStyle: this.context.strokeStyle,
      lineWidth: this.context.lineWidth,
      lineCap: this.context.lineCap,
      type: 'begin'
    });
  };

  touchmove = coors => {
    if (this.isDrawing) {
      this.context.lineTo(coors.x, coors.y);
      this.context.stroke();
      this.actions.push({
        context: this.context,
        coors,
        strokeStyle: this.context.strokeStyle,
        lineWidth: this.context.lineWidth,
        lineCap: this.context.lineCap,
        type: 'draw'
      });
    }
  };

  touchend = coors => {
    if (this.isDrawing) {
      this.touchmove(coors);
      this.stack.push(this.actions);
      this.actions = [];
      this.isDrawing = false;
    }
  };

  draw = event => {
    const coors = {
      x: this.getX(event),
      y: this.getY(event)
    };
    // pass the coordinates to the appropriate handler
    this[event.type](coors);
  };

  undo = () => {
    if (this.stack.length > 0) {
      this.redoStack.push(this.stack.pop());
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.redraw();
    }
  };

  redo = () => {
    if (this.redoStack.length > 0) {
      this.stack.push(this.redoStack.pop());
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.redraw();
    }
  };

  redraw = () => {
    this.context.drawImage(
      this.baseImg,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.stack.forEach(actions => {
      actions.forEach(command => {
        this.context.strokeStyle = command.strokeStyle;
        this.context.lineWidth = command.lineWidth;
        this.context.lineCap = command.lineCap;
        if (command.type === 'begin') {
          this.context.beginPath();
          this.context.moveTo(command.coors.x, command.coors.y);
        } else if (command.type === 'draw') {
          this.context.lineTo(command.coors.x, command.coors.y);
          this.context.stroke();
        }
      });
    });
  };

  resetCanvas = () => {
    this.stack = [];
    this.redoStack = [];
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      this.baseImg,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  };

  toggleComment = () => {
    const showComment = !this.state.showComment;
    const selectedBtns = [...this.state.selected];
    const index = selectedBtns.indexOf('comment');

    if (showComment && index === -1) {
      selectedBtns.push('comment');
    } else if (!showComment && index > -1) {
      selectedBtns.splice(index, 1, null);
    }

    this.setState({
      selected: selectedBtns,
      showComment
    });
  };

  hideComment = () => {
    const selectedBtns = [...this.state.selected];
    const index = selectedBtns.indexOf('comment');
    if (index > -1) {
      selectedBtns.splice(index, 1, null);
    }

    this.setState({
      selected: selectedBtns,
      showComment: false
    });
  };

  saveImage = () =>
    new Promise(resolve => {
      const imageSmall = new Image();
      imageSmall.src = this.canvas.toDataURL('image/png');
      imageSmall.onload = () => {
        if (this.isSquarePhoto) {
          this.canvasSmall.width = 480;
          this.canvasSmall.height = 480;

          const context = this.canvasSmall.getContext('2d');
          context.drawImage(imageSmall, 0, 0, 480, 480);
        } else {
          const dimensions = this.getImageDimensionsToSave();
          const context = this.canvasSmall.getContext('2d');

          this.canvasSmall.width =
            this.orientation === 'landscape'
              ? dimensions.height
              : dimensions.width;
          this.canvasSmall.height =
            this.orientation === 'landscape'
              ? dimensions.width
              : dimensions.height;

          if (this.orientation === 'landscape') {
            // translate image at the bottom-left hand corner
            context.translate(0, dimensions.width);
            // rotate 270 degrees around this point (radians)
            context.rotate(4.71239);
          }

          // draw image in the canvas
          context.drawImage(
            imageSmall,
            0,
            0,
            dimensions.width,
            dimensions.height
          );
        }

        const image = this.canvasSmall.toDataURL('image/jpeg', 0.8);

        resolve({
          id: this.guid(),
          src: image,
          text: this.state.comment,
          orientation: this.orientation,
          width: this.canvasSmall.width,
          height: this.canvasSmall.height
        });
      };
    });

  guid = () => {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  };

  renderComment = () => (
    <TransitionGroup>
      {this.state.showComment && (
        <CSSTransition timeout={500} classNames="annotatorFade">
          <div className="comment-container">
            <textarea
              name="comment"
              value={this.state.comment}
              onChange={this.onCommentChange}
            />
          </div>
        </CSSTransition>
      )}
    </TransitionGroup>
  );

  renderSvgButton = (svg, label) => (
    <button
      className={`${this.state.selected.indexOf(label) > -1 && 'selected'}`}
      onClick={() => this.onClickFooterBtn(label)}
    >
      <object type="image/svg+xml" data={svg} aria-label={label} />
    </button>
  );

  renderAnnotator = () => (
    <div className="Annotator">
      <header>
        <button className="cancel" onClick={this.props.onCancel}>
          Cancel
        </button>
        <div className="title">{this.props.title}</div>
        <button className="done" onClick={this.onClickDone}>
          Done
        </button>
      </header>
      <div className="canvas-container">
        <div
          className="annotate-container"
          ref={ref => {
            this.annotateContainer = ref;
          }}
        >
          <canvas
            onTouchStart={this.draw}
            onTouchMove={this.draw}
            onTouchEnd={this.draw}
            ref={ref => {
              this.canvas = ref;
            }}
          />
        </div>
        <canvas
          className="hide"
          ref={ref => {
            this.canvasRotate = ref;
          }}
        />
        <canvas
          className="hide"
          ref={ref => {
            this.canvasSmall = ref;
          }}
        />
        {this.renderComment()}
      </div>
      <footer>
        <div className="buttons">
          {this.renderSvgButton(trashSvg, 'trash')}
          {this.renderSvgButton(undoSvg, 'undo')}
          {this.renderSvgButton(redoSvg, 'redo')}
          {this.renderSvgButton(commentSvg, 'comment')}
          {this.renderSvgButton(highlighterSvg, 'highlighter')}
          {this.renderSvgButton(penSvg, 'pen')}
        </div>
      </footer>
    </div>
  );

  renderViewOnly = () => (
    <div className="Annotator">
      <header>
        <div className="title">{this.props.title}</div>
        <button className="done" onClick={this.onClickDone}>
          Done
        </button>
      </header>
      <div className="image-container">
        <img src={this.props.image} alt="" />
      </div>
    </div>
  );

  render() {
    return (
      <BodyEnd>
        <TransitionGroup>
          {this.props.isOpen && (
            <CSSTransition
              timeout={this.transitionTimeout}
              classNames="annotatorSlide"
            >
              {this.props.viewOnly
                ? this.renderViewOnly()
                : this.renderAnnotator()}
            </CSSTransition>
          )}
        </TransitionGroup>
      </BodyEnd>
    );
  }
}

Annotator.defaultProps = {
  title: '',
  image: '',
  viewOnly: false
};

Annotator.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  image: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  title: PropTypes.string,
  viewOnly: PropTypes.bool
};

export default Annotator;
export { DeviceImagePicker };
