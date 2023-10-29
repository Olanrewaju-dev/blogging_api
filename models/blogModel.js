const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  state: {
    type: String,
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
    type: String,
  },
  description: {
    type: String,
  },

  // one-to-many association with task model
  owner: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});

const BlogModel = mongoose.model("blogs", BlogSchema);

module.exports = BlogModel;
