const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { locals, messages } = require("express-messages");
const {
  body,
  validationResult,
  validationErrors,
} = require("express-validator");

const auth = require("../config/auth");
const isUser = auth.isUser;

//get page model
const Page = require("../models/pages");

//Get Pages index
router.get("/", isUser, (req, res) => {
  Page.find({})
    .sort({ sorting: 1 })
    .then((pages) => {
      res.render("../admin/pages", { pages: pages });
    })
    .catch((err) => console.log(err));
});

//Get Add Page
router.get("/add-page", isUser, (req, res) => {
  let title = "";
  let slug = "";
  let content = "";

  res.render("../admin/addpages", {
    title: title,
    slug: slug,
    content: content,
  });
});

//Posting pages only for the admin
const validationRules = [
  body("title", "Title must include a value !").notEmpty(),
  body("content", "Content must include a value !").notEmpty(),
];

router.post("/add-page", validationRules, (req, res) => {
  //get our actual form values
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  let content = req.body.content;

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("errors detected: " + JSON.stringify(errors.array()));
    res.render("../admin/addpages", {
      errors: errors.array(),
      title: title,
      slug: slug,
      content: content,
    });
  } else {
    Page.findOne({ slug: slug })
      .then((page) => {
        if (page) {
          req.flash("danger", "Page slug exist, choose another");
          res.render("../admin/addpages", {
            title: title,
            slug: slug,
            content: content,
          });
        } else {
          const page = new Page({
            title: title,
            slug: slug,
            content: content,
            sorting: 100,
          });

          page
            .save()
            .then((page) => {
              req.flash("success", "Page added!");
              res.redirect("/admin/pages");
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
});

//sort pages function
//Create Post reorder page routes
router.post("/reorder-pages", isUser, (req, res) => {
  let ids = req.body["id[]"];
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    count++;

    (function (count) {
      Page.findById(id)
        .then(function (page) {
          page.sorting = count;
          return page.save();
        })
        .then(function () {
          console.log("Page saved successfully");
        })
        .catch(function (err) {
          console.log(err);
        });
    })(count);
  }
});

//Get Edit Page
//Get Edit Page
router.get("/edit-page/:id", isUser, (req, res) => {
  Page.findById(req.params.id)
    .then(function (page) {
      res.render("../admin/edit_page", {
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// end of edit page

// POST EDIT DATA
const editvalidationRules = [
  body("title", "Title must include a value !").notEmpty(),
  body("content", "Content must include a value !").notEmpty(),
];

router.post("/edit-page/:id", editvalidationRules, (req, res) => {
  const id = req.params.id;

  //get our actual form values
  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  const content = req.body.content;

  // Validate id as a valid ObjectId
  // if (!mongoose.Types.ObjectId.isValid()) {
  //   return res.status(400).send("Invalid id parameter");
  // }

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("errors detected: " + JSON.stringify(errors.array()));
    Page.findById(id)
      .then((page) => {
        res.render("../admin/editpage", {
          errors: errors.array(),
          title: title,
          slug: slug,
          content: content,
          page: page,
        });
      })
      .catch((err) => console.log(err));
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } })
      .then((page) => {
        if (page) {
          req.flash("danger", "Page slug exists, choose another");
          res.render("../admin/editpage", {
            title: title,
            slug: slug,
            content: content,
            page: page,
          });
        } else {
          Page.findByIdAndUpdate(id, {
            title: title,
            slug: slug,
            content: content,
          })
            .then((page) => {
              req.flash("success", "Page updated!");
              res.redirect("/admin/pages");
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
});
//END OF POST EDIT PAGE

// Get delete page

router.get("/delete-page/:id", isUser, (req, res) => {
  Page.findByIdAndDelete(req.params.id)
    .then(() => {
      req.flash("success", "Page Deleted !");
      res.redirect("/admin/pages");
    })
    .catch((err) => console.error(err));
});
//
// exports
module.exports = router;
