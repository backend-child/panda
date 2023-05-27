exports.isReg = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("Danger", "Please log in.");
    res.redirect("/users/login");
  }
};

// is admin
exports.isUser = function (req, res, next) {
  if (req.isAuthenticated() && res.locals.user.admin == 1) {
    next();
  } else {
    req.flash("Danger", "Please log in As Admin.");
    res.redirect("/users/login");
  }
};
