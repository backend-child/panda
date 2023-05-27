const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { locals, messages } = require("express-messages");
const {
  body,
  validationResult,
  validationErrors,
} = require("express-validator");

const User = require("../models/user");

// Get user registered
router.get("/register", (req, res) => {
  res.render("../admin/register", {
    title: "Register",
  });
});

const validationRules = [
  body("name", "Name must include a value !").notEmpty(),
  body("email", "Email must include a value !").isEmail(),
  body("username", "Username must include a value !").notEmpty(),
  body("password", "Password must include a value !").notEmpty(),
];

// Get Post for Register Users
router.post("/register", validationRules, (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("errors detected: " + JSON.stringify(errors.array()));
    res.render("../admin/register", {
      errors: errors.array(),
      title: "Title",
      user: null,
      name: name,
      email: email,
      username: username,
      password: password,
    });
  } else {
    User.findOne({ username: username })
      .then((user) => {
        if (user) {
          req.flash("danger", "username exists, choose another !");
          res.redirect("/users/register");
        } else {
          const newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            admin: 0,
          });
          return bcrypt
            .genSalt(10)
            .then((salt) => bcrypt.hash(password, salt))
            .then((hash) => {
              password = hash;
              return newUser.save();
            })
            .then(() => {
              req.flash("success", "You are now Registered exists  !");
              res.redirect("/users/login");
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
});

// Get get UserLogin

router.get("/login", (req, res) => {
  if (res.locals.user) res.redirect("/");

  res.render("../admin/login", {
    title: "Log In",
  });
});

// Get get UserLogin
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Get Log Out UserLogin

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      console.log(err);
    }
    req.flash("Sucess", "you are logged out ");
    res.redirect("/users/login");
  });
});
// exports
module.exports = router;
