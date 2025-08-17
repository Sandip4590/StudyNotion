const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

require("dotenv").config();

//otp send
exports.sendOtp = async (req, res) => {
  {
    try {
      //fetch data from req ki body

      const { email } = req.body;

      //check user if exist

      const checkUserPresent = await User.findOne({ email });

      //email  validation is pending ?

      // if user exist then return response

      if (checkUserPresent) {
        return res.status(401).json({
          success: false,
          message: "User Already Exist",
        });
      }

      // generate OTP

      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      console.log("Otp generated SuccessFully", otp);

      //check otp is unique or not

      let result = OTP.findOne({ otp: otp });

      // find service which can give every time unique otp ?

      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        const result = OTP.findOne({ otp: otp });
      }

      const otpPayload = { email, otp };

      // create an entry in DB

      const otpBody = OTP.create(otpPayload);
      console.log(otpBody);

      res.status(200).json({
        success: true,
        message: "OTP Sent SuccessFully",
        otp,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  }
};

exports.signUp = async (req, res) => {
  try {
    //data fetch from req ki body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validation

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    // match both password

    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message:
          "Password and Confirm Password Does not match , Please try Again",
      });
    }

    // check the user is already exist or not

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is Already Registerd",
      });
    }

    //find most recent otp

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("Print Recent Otp", recentOtp);

    // validate otp

    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      contactNumber: null,
      about: null,
      dateOfBirth: null,
    });
    // entry create in DB
    const user = await User.create({
      firstName,
      lastName,
      password: hashedPassword,
      email,
      additionalDetail: profileDetails._id,
      contactNumber,
      accountType,
      image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return response

    return res.status(200).json({
      success: true,
      message: "User is register SuccessFully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User is Not registerd , Please try again",
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fiels are required",
      });
    }

    const user = await User.findOne({ email }).populate("additionalDetail");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is Not Register,Please Sign-Up first",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      const options = {
        expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged In SuccessFully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is in correct",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failure",
    });
  }
};

exports.changePassword = async (req, res) => {
  //get data from req ki body old pass new pass and conf new pass

  try {
    const { oldPasswprd, newPassword, confirmNewPassword } = req.body;
    // validation

    if (!oldPasswprd || !newPassword || !confirmNewPassword) {
      return res.status(403).json({
        success: false,
        message: "All Field Are required",
      });
    }

    if (newPassword != confirmNewPassword) {
      return res.status(403).json({
        success: false,
        message:
          "newPassword and ConfirmPassword Does Not Match, Please try again",
      });
    }

    const user = await User.findById(req.use._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(oldPasswprd, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password Does Not Match , Please try again",
      });
    }

    const hashedPassword = await bcrypt.hash(confirmNewPassword, 10);

    await user.findByIdAndUpdate(
      user.req._id,
      { password: hashedPassword },
      { new: true }
    );

    await mailSender(
      user.email,
      "Your Password Has been Changed",
      `<h1>hello ${user.firstName}</h1>
      <p>Your password was successfully updated on ${new Date().toLocaleString()}.</p>
       <p>If this wasn't you, please reset your password immediately.</p>`
    );

    // then send mail password is updated

    return res.status(200).json({
      success: true,
      message: "Password Chnaged SuccessFully",
    });

    // return response
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing password",
    });
  }
};
