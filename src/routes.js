import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Transitions from './services/transitions';
import HomeView from './views/HomeView';

const Routes = props => {
  const timeout = { enter: 600, exit: 600 };

  return (
    <Transitions
      pageKey={props.location.pathname}
      transition="pageSliderRight"
      duration={timeout}
      {...props.location.state}
    >
      <Switch location={props.location}>
        <Route
          exact
          path="/"
          render={() => <HomeView setLoading={props.setLoading} />}
        />
      </Switch>
    </Transitions>
  );
};

export default withRouter(Routes);
