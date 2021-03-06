const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function (
  email,
  password,
  done
) {
  // Verify this email and password, and call 'done' with the user
  // if it is the correct email and password
  // otherwise call 'done' with false

  User.findOne({ email }, function (err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false);
    }

    // compare passwords - is 'password' equal to user.password?
    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err);
      }

      if (!isMatch) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
});

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT Strategy
// payload = decoded jwt token
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
  // See if the user ID in the payload exists in our DB
  User.findById(payload.sub, function (err, user) {
    if (err) {
      return done(err, false);
    }

    // If it does, call 'done' with that user
    if (user) {
      done(null, user);
    }
    // Otherwise, call 'done' without an user object
    else {
      done(null, false);
    }
  });
});

// Tell passport to use this Strategy
passport.use(jwtLogin);
passport.use(localLogin);
