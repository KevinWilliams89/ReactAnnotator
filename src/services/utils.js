import React from 'react';
import { Route } from 'react-router-dom';

export const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return React.createElement(component, finalProps);
};

export const PropsRoute = ({ component, ...rest }) => (
  <Route
    {...rest}
    render={routeProps => renderMergedProps(component, routeProps, rest)}
  />
);

export const removeKey = (obj, deleteKey) => {
  const clone = Object.assign({}, obj);
  delete clone[deleteKey];
  return clone;
};
