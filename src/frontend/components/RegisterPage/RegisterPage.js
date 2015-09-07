/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './RegisterPage.css';
import authenticationActionCreators from '../../actions/AuthenticationActionCreators';
import authenticationStore from '../../stores/AuthenticationStore';

@withStyles(styles)
class RegisterPage {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    let title = 'New User Registration';
    this.context.onSetTitle(title);
    return (
      <div className="RegisterPage">
        <div className="RegisterPage-container">
          <h1>{title}</h1>

          <form onSubmit={this._onSubmit.bind(this)}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" className="form-control" ref="username" id="username" placeholder="Username"/>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input type="email" className="form-control" ref="email" id="email" placeholder="Email"/>
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
    var data = {username: this.refs.username.value, 'email': this.refs.email.value, password: this.refs.password.value};
    authenticationActionCreators.doRegister(data);
  }

}

export default RegisterPage;
