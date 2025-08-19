const User = require("../models/User");
const mailSender = require("../utils/mailSender");

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body.email;

    const USer = await User.findOne({ email: email });

    if (!USer) {
      return res.status(500).json({
        success: false,
        message: "Your Email Is NOt Registerd with us",
      });
    }

    const token = crypto.randomUUID();
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );

    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link:${url}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Email Sent SuccessFully , Please Check Email and Change Your Password",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Soomething Went Wrong while Reset password",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (!password || !confirmPassword || !token) {
      return res.json({
        success: false,
        message: "All Fields are Require",
      });
    }
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password Not Matching",
      });
    }

    const userDetails = await User.findOne({ token: token });

    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token Is Invalid",
      });
    }
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token Is expired , Please regenerate Your Token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password Rsest SuccessFully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong While resetign password",
    });
  }
};
