import dispatcher from '../core/Dispatcher';
import ActionTypes from '../constants/ActionTypes';

class AuthenticationActionCreators {
  constructor() {
  }

  doRegister(data) {
    dispatcher.dispatch({
      type: ActionTypes.DO_REGISTER,
      data: data
    })
  }

  doLogin(data) {
    dispatcher.dispatch({
      type: ActionTypes.DO_LOGIN,
      data: data
    })
  }

}
export var authenticationActionCreators = new AuthenticationActionCreators();
export default authenticationActionCreators;


