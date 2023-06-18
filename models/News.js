const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    photo: {
      type: [String],
      required: false,
    },
    category: {
      type: [String],
      required: true,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
     
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", NewsSchema);
