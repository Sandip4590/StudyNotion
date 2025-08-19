const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
   confirmPassword: {
    type: String,
    required: true,
    trim: true,
  },
   contactNumber: {
    type: Number,
    required: true,
    trim: true,
  },
  accountType: {
    type: String,
    enum: ["Admin", "Instructor", "student"],
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  additionalDetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  courseProgress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseProgress",
  },
  token:{
    type:string,
  },
  resetPasswordExpires:{
    type:Date
  }
});

module.exports = mongoose.model("User", userSchema);
