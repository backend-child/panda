const mongoose = require("mongoose");

// Categorie schema
const CartegorySchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
  },
});

const Category = (module.exports = mongoose.model(
  "Cartegory",
  CartegorySchema
));
