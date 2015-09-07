import { join } from 'path';
import { Router } from 'express';
import { Config } from '../../config';
import { Passport } from '../services/passport';
const router = new Router();

router.post('/register', async (req, res, next) =>
    Passport.protocols.local.register(req.body, (err, user) => {
      if (err) {
        //res.status(400).json({'error': null});
        next(err);
        return;
      }

      req.login(user, (err) => {
        if (err) {
          console.log('LOGIN ERROR?', err);
          next(err);
          return;
        }
        console.log('LOGGED IN', req.user);
        res.json(user);
      });
    })
);

router.all('/logout', async (req, res) => {
  req.logout();
  delete req.user;
  delete req.session.passport;
  req.session.authenticated = false;

  if (!req.isSocket) {
    res.redirect(req.query.next || '/');
  }
  else {
    res.ok();
  }
});

router.get('/me', async (req, res, next) => {
  res.json(req.user);
});


router.all('/disconnect', async (req, res, next) => {
  Passport.endpoint(req, res, next);
});

router.all('/:provider', async (req, res, next) => {
  Passport.endpoint(req, res, () => {
    if (req.user) {
      res.json(req.user);
      return;
    }
    next();
  });
});

router.all('/:provider/:action', async (req, res, next) => {


  Passport.callback(req, res, function (err, user) {

    if (err || !user) {
    }

    req.login(user, function (err) {
      if (err) {
        return next(new Error('Not logged in'));
      }

      req.session.authenticated = true;

      // Upon successful login, optionally redirect the user if there is a
      // `next` query param
      if (req.query.next) {
        res.status(302).set('Location', req.query.next);
      }

      return res.json(user);
    });
  });
});

export default router;

