import url from 'url';
import passport from 'passport';
import { AuthConfig } from './../../config';
import _ from 'underscore';
import * as protocols from './passport/protocols';

passport.protocols = protocols;

passport.connect = function (req, query, profile, next) {
  var user = {};

  // Get the authentication provider from the query.
  query.provider = req.param('provider');

  // Use profile.provider or fallback to the query.provider if it is undefined
  // as is the case for OpenID, for example
  var provider = profile.provider || query.provider;

  // If the provider cannot be identified we cannot match it to a passport so
  // throw an error and let whoever's next in line take care of it.
  if (!provider) {
    return next(new Error('No authentication provider was identified.'));
  }

  // If the profile object contains a list of emails, grab the first one and
  // add it to the user.
  if (profile.hasOwnProperty('emails')) {
    user.email = profile.emails[0].value;
  }
  // If the profile object contains a username, add it to the user.
  if (profile.hasOwnProperty('username')) {
    user.username = profile.username;
  }

  // If neither an email or a username was available in the profile, we don't
  // have a way of identifying the user in the future. Throw an error and let
  // whoever's next in the line take care of it.
  if (!user.username && !user.email) {
    return next(new Error('Neither a username nor email was available'));
  }

  var User = server.models.user;
  var Passport = server.models.passport;

  Passport.findOne({
    provider: provider
    , identifier: query.identifier.toString()
  }, function (err, passport) {
    if (err) {
      return next(err);
    }

    if (!req.user) {
      // Scenario: A new user is attempting to sign up using a third-party
      //           authentication provider.
      // Action:   Create a new user and assign them a passport.
      if (!passport) {
        server.models.user.create(user, function (err, user) {
          if (err) {
            if (err.code === 'E_VALIDATION') {
              if (err.invalidAttributes.email) {
                err = new Error('Error.Passport.Email.Exists');
              }
              else {
                err = new Error('error', 'Error.Passport.User.Exists');
              }
            }

            return next(err);
          }

          query.user = user.id;

          Passport.create(query, function (err, passport) {
            // If a passport wasn't created, bail out
            if (err) {
              return next(err);
            }

            next(err, user);
          });
        });
      }
      // Scenario: An existing user is trying to log in using an already
      //           connected passport.
      // Action:   Get the user associated with the passport.
      else {
        // If the tokens have changed since the last session, update them
        if (query.hasOwnProperty('tokens') && query.tokens !== passport.tokens) {
          passport.tokens = query.tokens;
        }

        // Save any updates to the Passport before moving on
        passport.save(function (err, passport) {
          if (err) {
            return next(err);
          }

          // Fetch the user associated with the Passport
          server.models.user.findOne(passport.user.id, next);
        });
      }
    } else {
      // Scenario: A user is currently logged in and trying to connect a new
      //           passport.
      // Action:   Create and assign a new passport to the user.
      if (!passport) {
        query.user = req.user.id;

        Passport.create(query, function (err, passport) {
          // If a passport wasn't created, bail out
          if (err) {
            return next(err);
          }

          next(err, req.user);
        });
      }
      // Scenario: The user is a nutjob or spammed the back-button.
      // Action:   Simply pass along the already established session.
      else {
        next(null, req.user);
      }
    }
  });
};

passport.endpoint = function (req, res, next) {
  var strategies = AuthConfig.providers;
  var provider = req.params['provider'];
  var options = {};


  // If a provider doesn't exist for this endpoint, send the user back to the
  // login page
  if (!strategies.hasOwnProperty(provider)) {
    return res.redirect('/login');
  }

  // Attach scope if it has been set in the config
  if (strategies[provider].hasOwnProperty('scope')) {
    options.scope = strategies[provider].scope;
  }

  // Redirect the user to the provider for authentication. When complete,
  // the provider will redirect the user back to the application at
  //     /auth/:provider/callback
  this.authenticate(provider, options)(req, res, next);
};

passport.callback = function (providers, req, res, next) {
  var provider = req.param('provider', 'local');
  var action = req.param('action');

  // Passport.js wasn't really built for local user registration, but it's nice
  // having it tied into everything else.
  if (provider === 'local' && action !== undefined) {
    if (action === 'register' && !req.user) {
      providers.local.register(req, res, next);
    }
    else if (action === 'connect' && req.user) {
      providers.local.connect(req, res, next);
    }
    else if (action === 'disconnect' && req.user) {
      providers.local.disconnect(req, res, next);
    }
    else {
      next(new Error('Invalid action'));
    }
  } else {
    if (action === 'disconnect' && req.user) {
      this.disconnect(req, res, next);
    } else {
      // The provider will redirect the user to this URL after approval. Finish
      // the authentication process by attempting to obtain an access token. If
      // access was granted, the user will be logged in. Otherwise, authentication
      // has failed.
      this.authenticate(provider, next)(req, res, req.next);
    }
  }
};

passport.loadStrategies = function () {
  var self = this;
  var strategies = AuthConfig.providers;

  Object.keys(strategies).forEach(function (key) {
    var options = {passReqToCallback: true};
    var Strategy;

    if (key === 'local') {
      // Since we need to allow users to login using both usernames as well as
      // emails, we'll set the username field to something more generic.
      _.extend(options, {usernameField: 'identifier'});

      // Only load the local strategy if it's enabled in the config
      if (strategies.local) {
        Strategy = strategies[key].strategy;

        self.use(new Strategy(options, self.protocols.local.login));
      }
    } else {
      var protocol = strategies[key].protocol;
      var callback = strategies[key].callback;

      if (!callback) {
        callback = path.join('auth', key, 'callback');
      }

      Strategy = strategies[key].strategy;

      var baseUrl = 'http://127.0.0.1:3000'; //FIXME

      switch (protocol) {
        case 'oauth':
        case 'oauth2':
          options.callbackURL = url.resolve(baseUrl, callback);
          break;

        case 'openid':
          options.returnURL = url.resolve(baseUrl, callback);
          options.realm = baseUrl;
          options.profile = true;
          break;
      }

      // Merge the default options with any options defined in the config. All
      // defaults can be overriden, but I don't see a reason why you'd want to
      // do that.
      _.extend(options, strategies[key].options);

      self.use(new Strategy(options, self.protocols[protocol]));
    }
  });
};

/**
 * Disconnect a passport from a user
 *
 * @param  {Object} req
 * @param  {Object} res
 */
passport.disconnect = function (req, res, next) {
  var user = req.user;
  var provider = req.param('provider');
  var Passport = server.models.passport;

  Passport.findOne({
    provider: provider,
    user: user.id
  }, function (err, passport) {
    if (err) return next(err);
    Passport.destroy(passport.id, function passportDestroyed(err) {
      if (err) return next(err);
      next(null, user);
    });
  });
};

passport.serializeUser(function (user, next) {
  next(null, user.id);
});

passport.deserializeUser(function (id, next) {
  server.models.user.findOne(id)
    .then(function (user) {
      next(null, user || null);
    })
    .catch(function (error) {
      next(error);
    });

});

export var Passport = passport;
export default Passport;
