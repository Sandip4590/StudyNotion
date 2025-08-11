const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});

async function sendVerificationMail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification from sendy",
      otp
    );
    console.log("That is mail Response", mailResponse);
  } catch (e) {
    console.log("Error while sending varification mail");

    console.error(e);
  }
}

otpSchema.pre("save", async function (next) {
  await sendVerificationMail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
