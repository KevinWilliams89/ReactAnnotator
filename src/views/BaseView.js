import React, { Fragment } from 'react';
import Wrapper from '../components/Wrapper/Wrapper';
import Loading from '../components/Loading/Loading';

const BaseView = props => (
  <Fragment>
    <Wrapper>{props.children}</Wrapper>
    <Loading loading={props.loading} loadingText={props.loadingText} />
  </Fragment>
);

export default BaseView;
