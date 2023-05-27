const express = require("express");
const router = express.Router();
const auth = require("../config/auth");
const isReg = auth.isReg;

// Get Products Model

const Products = require("../models/products");

// Get all Products
// Get the root Products
router.get("/", isReg, (req, res) => {
  Products.find()
    .then((products) => {
      res.render("../admin/all_products", {
        title: "All products",
        products: products,
      });
    })
    .catch((err) => console.log(err));
});

// Get the root home
// Get a page
// router.get("/:slug", (req, res) => {
//   let slug = req.params.slug;
//   Page.findOne({ slug: slug })
//     .then((page) => {
//       if (!page) {
//         res.redirect("/");
//         return;

//       }
//       res.render("index", {
//         title: page.title,
//         content: page.content,
//       });
//     })
//     .catch((err) => console.log(err));
// });

// exports
module.exports = router;
