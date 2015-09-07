import _ from 'underscore';

export var local = {
  login: function (req, identifier, password, next) {
    var isEmail = validateEmail(identifier)
      , query = {};

    if (isEmail) {
      query.email = identifier;
    }
    else {
      query.username = identifier;
    }

    server.models.user.findOne(query, function (err, user) {

      if (err) {
        return next(err);
      }

      if (!user) {
        if (isEmail) {
          next(new Error('Error.Passport.Email.NotFound'));
        } else {
          next(new Error('Error.Passport.Username.NotFound'));
        }

        return next(null, false);
      }

      server.models.passport.findOne({
        protocol: 'local'
        , user: user.id
      }, function (err, passport) {
        if (passport) {
          passport.validatePassword(password, function (err, res) {

            if (err) {
              return next(err);
            }

            if (!res) {
              next(new Error('Error.Passport.Password.Wrong'));
              return next(null, false);
            } else {
              return next(null, user, passport);
            }
          });
        }
        else {
          next(new Error('error', 'Error.Passport.Password.NotSet'));
          return next(null, false);
        }
      });
    });
  },
  register: function (data, next) {
    var password = data.password;
    delete data.password;

    server.models.user.create(data, (err, user) => {
      if (err) {
        return next(err);
      }

      server.models.passport.create({
        protocol: 'local'
        , password: password
        , user: user.id
      }, function (err, passport) {
        if (err) {
          /*          if (err.code === 'E_VALIDATION') {
           err = new Error({originalError: err});
           }*/

          return user.destroy(function (destroyErr) {
            next(destroyErr || err);
          });
        }

        next(null, user);
      });
    });
  },
  connect: function (req, res, next) {
    var user = req.user
      , password = req.params['password']
      , Passport = server.models.passport;

    Passport.findOne({
      protocol: 'local'
      , user: user.id
    }, function (err, passport) {
      if (err) {
        return next(err);
      }

      if (!passport) {
        Passport.create({
          protocol: 'local'
          , password: password
          , user: user.id
        }, function (err, passport) {
          next(err, user);
        });
      }
      else {
        next(null, user);
      }
    });
  }
};


var EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

/**
 * Use validator module isEmail function
 *
 * @see <https://github.com/chriso/validator.js/blob/3.18.0/validator.js#L38>
 * @see <https://github.com/chriso/validator.js/blob/3.18.0/validator.js#L141-L143>
 */
function validateEmail(str) {
  return EMAIL_REGEX.test(str);
}
