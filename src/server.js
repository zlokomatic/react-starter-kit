/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import 'babel/polyfill';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import ReactDOM from 'react-dom/server';
import Router from './frontend/Router';
import getOrm from './backend/services/orm';
import passport from './backend/services/passport';

import authenticationStore from './frontend/stores/AuthenticationStore';

passport.loadStrategies();

const server = global.server = express();


server.set('port', (process.env.PORT || 5000));
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));
server.use(passport.initialize());
server.use(passport.session());

/*server.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', 'example.com');
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
 res.header('Access-Control-Allow-Headers', 'Content-Type');

 next();
 });*/

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/api/content', require('./backend/api/content'));
server.use('/api/auth', require('./backend/api/auth'));

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------

// The top-level React component + HTML template for it
const templateFile = path.join(__dirname, 'templates/index.html');
const template = _.template(fs.readFileSync(templateFile, 'utf8'));

server.get('*', async (req, res, next) => {

  authenticationStore.authentication = {
    isLoggedIn: !!req.user,
    userData: req.user
  };

  try {
    let statusCode = 200;
    const data = {title: '', description: '', css: '', body: '', userData: null};
    const css = [];
    const context = {
      onInsertCss: value => css.push(value),
      onSetTitle: value => data.title = value,
      onSetMeta: (key, value) => data[key] = value,
      onPageNotFound: () => statusCode = 404
    };

    await Router.dispatch({ path: req.path, context }, (state, component) => {
      data.body = ReactDOM.renderToString(component);
      data.css = css.join('');
      data.userData = req.user || null;
    });

    const html = template(data);
    res.status(statusCode).send(html);
  } catch (err) {
    next(err);
  }
});

//
// Launch the server
// -----------------------------------------------------------------------------
server.listen(server.get('port'), async () => {
  var orm = await getOrm();
  server.models = orm.collections;

  if (process.send) {
    process.send('online');
  } else {
    console.log('The server is running at http://localhost:' + server.get('port'));
  }
});

server.use((err, req, res, next) => {
  if (err.code === 'E_VALIDATION') {
    res.status(400).json(err.invalidAttributes);
    return;
  }
  console.log('ERROR', err);

  next(err);
});
