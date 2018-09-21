import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Routes from './routes';
import BaseView from './views/BaseView';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loadingText: 'Loading...'
    };

    document.addEventListener('deviceready', this.cordovaStarted, false);
  }

  componentWillReceiveProps() {
    window.previousLocation = this.props.location.pathname;
  }

  onSetLoading = (loading, loadingText = 'Loading...') => {
    this.setState({
      loading,
      loadingText
    });
  };

  cordovaStarted = () => {
    if (window.cordova) {
      window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
  };

  render() {
    return (
      <div onClick={() => {}}>
        <BaseView
          loading={this.state.loading}
          loadingText={this.state.loadingText}
        >
          <Routes setLoading={this.onSetLoading} />
        </BaseView>
      </div>
    );
  }
}

export default withRouter(App);
