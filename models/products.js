const mongoose = require("mongoose");

// Product Schema
const ProductSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
  },

  desc: {
    type: String,
    required: true,
  },

  cartegory: {
    type: String,
    required: false,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
  },
});

const Products = (module.exports = mongoose.model("Products", ProductSchema));
