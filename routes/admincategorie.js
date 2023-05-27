const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { locals, messages } = require("express-messages");
const {
  body,
  validationResult,
  validationErrors,
} = require("express-validator");

//get categorie model
const Cartegory = require("../models/categorie");
const auth = require("../config/auth");
const isUser = auth.isUser;

//Get Admin category Routes
router.get("/", isUser, (req, res) => {
  Cartegory.find()
    .then((categories) => {
      res.render("../admin/cartegories", { categories: categories });
    })
    .catch((err) => console.error(err));
});

//Get Add Cartegory
router.get("/add-cartegory", isUser, (req, res) => {
  let title = "";

  res.render("../admin/add_cartegory", {
    title: title,
  });
});

//Posting pages only for the admin
const validationRules = [
  body("title", "Title must include a value !").notEmpty(),
];

router.post("/add-cartegory", validationRules, (req, res) => {
  //get our actual form values
  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("errors detected: " + JSON.stringify(errors.array()));
    res.render("../admin/add_cartegory", {
      errors: errors.array(),
      title: title,
    });
  } else {
    Cartegory.findOne({ slug: slug })
      .then((cartegory) => {
        if (cartegory) {
          req.flash("danger", "Cartegory Title exist, choose another");
          res.render("../admin/add_cartegory", {
            title: title,
          });
        } else {
          const cartegory = new Cartegory({
            title: title,
          });

          cartegory
            .save()

            .then((cartegory) => {
              Cartegory.find()
                .then((cartegories) => {
                  req.app.locals.cartegories = cartegories;
                })
                .catch((err) => {
                  console.log(err);
                });

              req.flash("success", "Cartegory added!");
              res.redirect("/admin/cartegories");
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
});

//Get Edit Cartegory
//Get Edit Cartegory
router.get("/edit-cartegory/:id", isUser, (req, res) => {
  Cartegory.findById(req.params.id)
    .then(function (cartegory) {
      res.render("../admin/edit_cartegory", {
        title: cartegory.title,

        id: cartegory._id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// end of edit page

// POST EDIT  Cartegory
const editvalidationRules = [
  body("title", "Title must include a value !").notEmpty(),
];

router.post("/edit-cartegory/:id", editvalidationRules, (req, res) => {
  const id = req.params.id;

  //get our actual form values
  const title = req.body.title;
  let slug = req.body.title.replace(/\s+/g, "-").toLowerCase();

  // Validate id as a valid ObjectId
  // if (!mongoose.Types.ObjectId.isValid()) {
  //   return res.status(400).send("Invalid id parameter");
  // }

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("errors detected: " + JSON.stringify(errors.array()));
    Cartegory.findById(id)
      .then((cartegory) => {
        res.render("../admin/edit_cartegory", {
          errors: errors.array(),
          title: title,
          id: id,
        });
      })
      .catch((err) => console.log(err));
  } else {
    Cartegory.findOne({ slug: slug, _id: { $ne: id } })
      .then((cartegory) => {
        if (cartegory) {
          req.flash("danger", "Cartegory Title exists, choose another");
          res.render("../admin/edit_cartegory", {
            title: title,
            id: id,
          });
        } else {
          Cartegory.findByIdAndUpdate(id, {
            title: title,
            slug: slug,
          })
            .then((cartegory) => {
              // in case of recent crash delete
              Cartegory.find()
                .then((cartegories) => {
                  req.app.locals.cartegories = cartegories;
                })
                .catch((err) => {
                  console.log(err);
                });
              //end of my incase
              req.flash("success", "Cartegory updated!");
              res.redirect("/admin/cartegories");
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
});
//END OF POST EDIT PAGE

// Get delete Cartegory

router.get("/delete-cartegory/:id", isUser, (req, res) => {
  Cartegory.findByIdAndDelete(req.params.id)
    .then(() => {
      Cartegory.find()
        .then((cartegories) => {
          req.app.locals.cartegories = cartegories;
        })
        .catch((err) => {
          console.log(err);
        });
      req.flash("success", "Cartegory Deleted !");
      res.redirect("/admin/cartegories");
    })
    .catch((err) => console.error(err));
});
//
// exports
module.exports = router;
