/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes } from 'react';
import styles from './LoginPage.css';
import withStyles from '../../decorators/withStyles';
import authenticationActionCreators from '../../actions/AuthenticationActionCreators';
import authenticationStore from '../../stores/AuthenticationStore';

@withStyles(styles)
class LoginPage {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    let title = 'Log In';
    this.context.onSetTitle(title);
    return (
      <div className="LoginPage">
        <div className="LoginPage-container">
          <h1>{title}</h1>

          <form onSubmit={this._onSubmit.bind(this)}>
            <div className="form-group">
              <label htmlFor="identifier">Email address</label>
              <input type="identifier" className="form-control" ref="identifier" id="identifier"
                     placeholder="Username / Email"/>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control" ref="password" id="password" placeholder="Password"/>
            </div>
            <button type="submit" className="btn btn-default">Submit</button>
          </form>
        </div>
      </div>
    );
  }

  _onSubmit(e) {
    e.preventDefault();
    var data = {'identifier': this.refs.identifier.value, password: this.refs.password.value};
    authenticationActionCreators.doLogin(data);
  }

}

export default LoginPage;
