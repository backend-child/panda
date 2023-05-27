const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const colors = require("colors");
const config = require("./config/database");
const bodyParser = require("body-parser");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const fileUpload = require("express-fileupload");
const mkdirp = require("mkdirp");
const makedir = require("make-dir");
const passport = require("passport");

//connect to database first
const connectDB = async () => {
  const conn = await mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  });

  console.log("SUCESSFULLY CONNECTED TO DATABASE".green.bold.underline);
};

connectDB();

// initialize app
const app = express();

// view engine
app.set("views", path.join(__dirname, "views"));

// set the template engine
app.set("view engine", "ejs");

// set the public folder
app.use(express.static(path.join(__dirname, "public")));

// set Global errors variables
app.locals.errors = null;

// get Page Model
const Page = require("./models/pages");

// get all pages to pass to header.ejs

Page.find({})
  .sort({ sorting: 1 })
  .then((pages) => {
    app.locals.pages = pages;
  })
  .catch((err) => console.log(err));

// end of get pages to header

// get Cartegory Model
const Cartegory = require("./models/categorie");

// get all Cartegories to pass to header.ejs

Cartegory.find()

  .then((cartegories) => {
    app.locals.cartegories = cartegories;
  })
  .catch((err) => console.log(err));
// Express file-upload Middle-ware
app.use(fileUpload());
// intergrate body-parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Express session middle-ware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

//Express validator middleware
app.use(
  body({
    errorFormatter: function (param, msg, value) {
      const namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }

      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },

    customValidators: {
      isImage: function (value, filename) {
        let extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      },
    },
  })
);

// Express messages
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// passport config file
require("./config/passport")(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//global *
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// set the routes
const pages = require("./routes/pages");
const products = require("./routes/products");
const users = require("./routes/users");
const adminPages = require("./routes/adminPages");
const admincategorie = require("./routes/admincategorie");
const adminproduct = require("./routes/adminproduct");

//set the middleware to link the route to the file
app.use("/admin/pages", adminPages);
app.use("/admin/cartegories", admincategorie);
app.use("/admin/products", adminproduct);
app.use("/products", products);

app.use("/", pages);
app.use("/users", users);

// start the server
const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port 3000".blue.bold.underline);
});
