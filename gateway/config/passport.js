const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

module.exports = function (passport) {
  // Local Signup Strategy
  passport.use(
    'signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const existingUser = await userModel.findOne({ email });

          if (existingUser) {
            return done(null, false, req.flash('signupMessage', 'Email already exists'));
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await userModel.create({ email, password: hashedPassword });

          return done(null, user);
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );

  // Local Login Strategy
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const user = await userModel.findOne({ email });

          if (!user) {
            return done(null, false, req.flash('loginMessage', 'User not found'));
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, req.flash('loginMessage', 'Incorrect password'));
          }

          return done(null, user);
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    userModel.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err, null);
      });
  }); 
};
