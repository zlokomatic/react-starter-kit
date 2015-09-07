import dispatcher from '../core/Dispatcher';
import ActionTypes from '../constants/ActionTypes';
import EventEmitter from 'events';
import HttpClient from '../core/HttpClient';

var CHANGE_EVENT = 'change';

export class BaseStore extends EventEmitter {
  constructor() {
    super();
    this.dispatcher = dispatcher;
    this.actionTypes = ActionTypes;
    this.httpClient = HttpClient;
    this.dispatchToken = null;
  }

  /**
   * @param {function} callback
   */
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  /**
   * @param {function} callback
   */
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}

export default BaseStore;
