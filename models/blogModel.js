const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;
const BlogSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    Enum: ["draft", "published"],
    default: "draft",
    required: true,
  },
  read_count: {
    type: Number,
    default: 0,
  },
  reading_time: {
    type: Number,
  },
  author: {
    type: String,
  },
  tag: {
    type: Array,
    default: [],
  },
  excerpt: {
    type: String,
  },

  // one-to-many association with user model
  owner: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});

const BlogModel = mongoose.model("blogs", BlogSchema);

module.exports = BlogModel;
