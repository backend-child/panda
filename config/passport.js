const LocalStrategy = require("passport-local").Strategy;

const passport = require("passport");
const User = require("../models/user");

const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(function (username, password, done) {
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "No user found" });
          }
          // compare the hashed password directly with the entered plaintext password
          if (password !== password) {
            return done(null, false, {
              message: "Incorrect password",
            });
          }
          // password is correct, return the user object
          return done(null, user);
        })
        .catch((err) => console.log(err));
    })
  );
};

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});
