const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
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
    desc: {
      type: String,
      required: true,
    },
    photo: {
      type: [String],
      required: false,
    },
    eventlink : {
      type: String,
      required: false,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    eventdate: {
      type: String,
      required: false,
    },
    eventtime: {
      type: String,
      required: false,
    },
    eventlocation: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
