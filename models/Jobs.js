const mongoose = require("mongoose");

const JobsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: false,
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
    salary: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    
    companylogo: {
      type: String,
      required: false,
    },
    companyname: {
      type: String,
      required: true,
    },
    skillsrequired: {
      type: [String],
      required: true,
    },
    applicationlink: {
      type: String,
      required: false,
    },
    applicationdeadline: {
      type: String,
      required: false,
    },
    applicationtype: {
      type: String,
      required: false,
    },
    jobtype: {
      type: String,
      required: false,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Jobs", JobsSchema);
