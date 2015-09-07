import fs from 'fs';
import * as Waterline from 'waterline';
import { DatabaseConfig } from './../../config';
import User from './../models/User';
import Passport from './../models/Passport';

export var orm = new Waterline['default']();

var getOrm = () => new Promise((resolve, reject) => {

  orm.loadCollection(User);
  orm.loadCollection(Passport);

  orm.initialize(DatabaseConfig, (err, models) => {
    if (err) {
      return reject(err);
    }

    resolve(models);
  });

});

export default getOrm;
