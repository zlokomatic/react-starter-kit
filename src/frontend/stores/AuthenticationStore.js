import BaseStore from './BaseStore';

class AuthenticationStore extends BaseStore {
  constructor() {
    super();

    let userData = (typeof window !== 'undefined' && typeof window.userData !== 'undefined') ? window.userData : null;
    this.authentication = {
      isLoggedIn: !!userData,
      userData: userData
    };

    this.errors = {register: {}, login: {}};
  }

  getAuthenticationData() {
    return this.authentication;
  }

  getAuthenticationErrors() {
    return this.errors;
  }

  doRegister(data) {
    this.httpClient.post('/api/auth/register', data)
      .then((resp) => {
        this.authentication.isLoggedIn = true;
        this.authentication.userData = resp;
        this.emit('change');
      })
      .catch((err) => {
        if (!err.text) {
          return;
        }

        this.errors.register = JSON.parse(err.text);
        this.emit('error');
      });
  }

  doLogin(data) {
    this.httpClient.post('/api/auth/local', data)
      .then((resp) => {
        this.authentication.isLoggedIn = true;
        this.authentication.userData = resp;
        this.emit('change');
      })
      .catch((err) => {
        if (!err.text) {
          return;
        }

        this.errors.login = JSON.parse(err.text);
        this.emit('error');
      });
  }

  doLogout() {
    this.httpClient.post('/api/auth/logout', {})
      .then((resp) => {
        this.authentication.isLoggedIn = false;
        this.authentication.userData = null;
        this.emit('change');
      });
  }
}

export var authenticationStore = new AuthenticationStore();
export default authenticationStore;

authenticationStore.dispatchToken = authenticationStore.dispatcher.register(function (action) {
  switch (action.type) {
    case authenticationStore.actionTypes.DO_REGISTER:
      authenticationStore.doRegister(action.data);
      break;
    case authenticationStore.actionTypes.DO_LOGIN:
      authenticationStore.doLogin(action.data);
      break;
  }
});
