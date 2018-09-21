import React from 'react';
import './Loading.css';

const Loading = props => {
  if (props.loading) {
    return (
      <div className="loading">
        <div className="loading-container">
          <div className="ball-clip-rotate" />
          <div className="text">{props.loadingText}</div>
        </div>
      </div>
    );
  }
  return <div />;
};

export default Loading;
