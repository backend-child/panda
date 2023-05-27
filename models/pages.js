const mongoose = require("mongoose");

// page schema
const PageSchema = mongoose.Schema({
  // _id: {
  //   type: Schema.Types.ObjectId,
  //   auto: true,
  // },
  title: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
  },

  content: {
    type: String,
    required: true,
  },

  sorting: {
    type: Number,
  },
});

const Page = (module.exports = mongoose.model("Page", PageSchema));
