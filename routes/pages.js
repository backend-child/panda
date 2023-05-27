const express = require("express");
const router = express.Router();
const Page = require("../models/pages");

// Get the root home
router.get("/", (req, res) => {
  Page.findOne({ slug: "home" })
    .then((page) => {
      res.render("index", {
        title: page.title,
        content: page.content,
        slug: page.slug,
      });
    })
    .catch((err) => console.log(err));
});

// Get the root home
// Get a page
router.get("/:slug", (req, res) => {
  let slug = req.params.slug;
  Page.findOne({ slug: slug })
    .then((page) => {
      if (!page) {
        res.redirect("/");
        return;
      }
      res.render("index", {
        title: page.title,
        content: page.content,
      });
    })
    .catch((err) => console.log(err));
});

// exports
module.exports = router;
