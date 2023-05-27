const express = require("express");
const router = express.Router();
const fs = require("fs-extra");

const resizeImg = require("resize-img");
const mongoose = require("mongoose");
const { locals, messages } = require("express-messages");
const {
  body,
  validationResult,
  validationErrors,
} = require("express-validator");

const auth = require("../config/auth");
const isUser = auth.isUser;

// const mkdirp = require("mkdirp");
const makeDir = require("make-dir");

//get Product model
const Products = require("../models/products");

//get Cartegory model
const Cartegory = require("../models/categorie");

//Get Products index
router.get("/", isUser, (req, res) => {
  const countPromise = Products.countDocuments();
  const productsPromise = Products.find().exec();

  Promise.all([countPromise, productsPromise])
    .then(([count, products]) => {
      res.render("../admin/products", {
        count: count,
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//Get Add Product
router.get("/add-product", isUser, (req, res) => {
  let title = "";
  let desc = "";
  let price = "";

  Cartegory.find()
    .then((cartegories) => {
      res.render("../admin/add_product", {
        title: title,
        desc: desc,
        cartegories: cartegories,
        price: price,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//Posting PRODUCT only for the admin
// add-product route
// Add validation rules
const validationRules = [
  body("title", "Title must include a value!").notEmpty(),
  body("desc", "Description must include a value!").notEmpty(),
  body("cartegory", "Cartegory must include a value!").notEmpty(),
  body("price", "Price must include a value!").isDecimal(),
  body("image", "Image must be uploaded").custom(
    (value, { req }) => req.files !== null
  ),
];

router.post("/add-product", validationRules, (req, res) => {
  // add this line  console.log(req.file);
  console.log(req.file);
  const imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : "";
  //validation rules

  //get our actual form values
  let title = req.body.title;
  let slug = req.body.slug;

  let desc = req.body.desc;
  let price = req.body.price;
  let cartegory = req.body.cartegory;

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    Cartegory.find()
      .then((cartegories) => {
        res.render("../admin/add_product", {
          errors: errors.array(),
          title: title,
          desc: desc,
          cartegories: cartegories,
          price: price,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Products.findOne({ title: title }).then((products) => {
      if (products) {
        req.flash("danger", "Product Title exist, choose another");
        Cartegory.find()
          .then((cartegories) => {
            res.render("../admin/add_product", {
              title: title,
              desc: desc,
              cartegories: cartegories,
              price: price,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        const price2 = parseFloat(price).toFixed(2);
        const product = new Products({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          cartegory: cartegory,
          image: imageFile,
        });

        product
          .save()
          .then(() => {
            return Promise.all([
              makeDir("public/product_images/" + product._id),
              makeDir("public/product_images/" + product._id + "/gallery"),
              makeDir(
                "public/product_images/" + product._id + "/gallery/thumbs"
              ),
            ]);
          })
          .then(() => {
            req.flash("success", "Added !");
            res.redirect("/admin/products");
          })
          .catch((err) => {
            console.log(err);
            res.redirect("/admin/products");
          });

        if (imageFile != "") {
          let productImage = req.files.image;
          let dirPath = "public/product_images/" + product._id;
          let filePath = dirPath + "/" + imageFile;

          // Create nested directory structure using fs and make-dir
          fs.mkdirSync(dirPath, { recursive: true });
          makeDir.sync(dirPath);

          productImage.mv(filePath, function (err) {
            if (err) {
              return console.log(err);
            }
          });
        }
      }
    });
  }
});

//Create Post reorder page routes
//Get Edit Page
//Get Edit Page
router.get("/edit-product/:id", isUser, (req, res) => {
  let errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Cartegory.find()
    .then((cartegories) => {
      Products.findById(req.params.id)
        .then((p) => {
          let galleryDir = "public/product_images/" + p._id + "/gallery";
          let galleryImages = null;
          fs.promises
            .readdir(galleryDir)
            .then((files) => {
              galleryImages = files;
              res.render("../admin/edit_product", {
                errors: errors,
                title: p.title,
                desc: p.desc,
                cartegories: cartegories,
                cartegory: p.cartegory,
                price: p.price,
                image: p.image,
                galleryImages: galleryImages,
                productId: p._id,
              });
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/admin/products");
            });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/admin/products");
        });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/admin/products");
    });
});

// end of edit page

// POST ADD PRODUCT
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

// Get delete product

router.get("/delete-product/:id", isUser, (req, res) => {
  let id = req.params.id;
  let path = "public/product_images/" + id;

  async function removeFile(path) {
    try {
      await fs.rmdir(path, { recursive: true });
      console.log("Directory removed!");
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  removeFile(path)
    .then(() => Products.findByIdAndDelete(id))
    .then(() => {
      req.flash("success", "Image deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => console.error(err));
});
//
// exports
module.exports = router;
