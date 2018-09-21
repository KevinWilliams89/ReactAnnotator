import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

/*
 * Helper functions to enable dynamic transitions between routes
 * for example, when pressing the back button we want the exit transition 
 * to be different from what the entry transition was
 * For more detail see:
 * https://github.com/ReactTraining/react-router/issues/5279
 * https://medium.com/lalilo/dynamic-transitions-with-react-router-and-react-transition-group-69ab795815c9
 */

const childFactoryCreator = props => child => React.cloneElement(child, props);

const Transitions = ({ transition, duration, pageKey, children, ...props }) => (
  <TransitionGroup
    childFactory={childFactoryCreator({
      classNames: transition,
      timeout: duration
    })}
    {...props}
  >
    <CSSTransition key={pageKey} classNames={transition} timeout={duration}>
      {children}
    </CSSTransition>
  </TransitionGroup>
);

export default Transitions;
