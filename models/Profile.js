const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
    trim: true,
  },
  about: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 100,
  },
  contactNumber: {
    type: Number,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
