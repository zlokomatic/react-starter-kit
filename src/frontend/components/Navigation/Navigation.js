/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes } from 'react';
import classNames from 'classnames';
import styles from './Navigation.css';
import withStyles from '../../decorators/withStyles';
import Link from '../Link';
import authenticationStore from '../../stores/AuthenticationStore';

let getAuthData = function () {
  return {
    authData: authenticationStore.getAuthenticationData()
  }
};
@withStyles(styles) class Navigation extends React.Component {

  static propTypes = {
    className: PropTypes.string
  };

  state = getAuthData();

  constructor(props) {
    super(props);

    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    authenticationStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    authenticationStore.removeChangeListener(this._onChange);
  }

  render() {
    return (
      <div className={classNames(this.props.className, 'Navigation')} role="navigation">
        <a className="Navigation-link" href="/about" onClick={Link.handleClick}>About</a>
        <a className="Navigation-link" href="/contact" onClick={Link.handleClick}>Contact</a>
        <span className="Navigation-spacer"> | </span>
        {this.renderUserData()}
      </div>
    );
  }

  renderUserData() {
    if (this.state.authData.isLoggedIn) {
      return (
        <span>
          Logged in as :{this.state.authData.userData.username}
          <a className="Navigation-link Navigation-link--highlight" href="/api/auth/logout" onClick={Link.handleClick}>Logout</a>
        </span>
      );
    }
    else {
      return (
        <span>
          <a className="Navigation-link" href="/login" onClick={Link.handleClick}>Log in</a>
          <span className="Navigation-spacer">or</span>
          <a className="Navigation-link Navigation-link--highlight" href="/register" onClick={Link.handleClick}>Sign
            up</a>
        </span>
      );
    }
  }

  _onChange() {
    this.setState(getAuthData());
  }

}

export default Navigation;
