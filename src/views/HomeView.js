import React from 'react';
import Home from '../components/Home/Home';

const HomeView = props => (
  <div className="page with-padding">
    <Home {...props} />
  </div>
);

export default HomeView;
