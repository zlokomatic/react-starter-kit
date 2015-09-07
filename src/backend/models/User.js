import { Collection } from 'waterline';
import _ from 'underscore';
import crypto from 'crypto';

export var User = Collection.extend({
  identity: 'user',
  connection: 'myLocalRedis',
  attributes: {
    username: {
      type: 'string',
      unique: true,
      index: true,
      notNull: true
    },
    email: {
      type: 'email',
      notNull: true,
      unique: true,
      index: true
    },
    passports: {
      collection: 'Passport',
      via: 'user'
    },
    avatar: {
      type: 'text',
      notNull: false
    },
    toJSON: function () {
      var user = this.toObject();
      delete user.password;
      return user;
    }
  },
  beforeCreate: function (user, next) {
    if (_.isEmpty(user.username)) {
      user.username = user.email;
    }
    next();
  }
});

export default User;
