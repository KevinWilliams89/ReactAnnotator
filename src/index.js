import initReactFastclick from 'react-fastclick';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from './app';
import './css/style.css';

const startApp = () => {
  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  );
};

initReactFastclick();
startApp();
