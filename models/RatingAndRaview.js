const mongoose = require("mongoose");
// const User = require("./User");

const ratingAndRaviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Rating: {
    type: Number,
    required: true,
  },
  Raview: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("RatingAndRaview", ratingAndRaviewSchema);
