const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken")

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
      additionalDetail:profileDetails._id,
      contactNumber,
      accountType,
      image:`http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    });


    // return response


    return res.status(200).json({
        success:true,
        message:"User is register SuccessFully",
        user
    })
  } catch (error) {

    console.log(error)
    return res.status(500).json({
        success:false,
        message:"User is Not registerd , Please try again"

    })
  }
};
exports.login = async(req,res) => {

  try{
  //fetch data from req ki body


    const {email, password} = req.body;



  // validation


  if(!email || !password){
    return res.status(403).json({
      success:false,
      message:"All fiels are required"
    })
  }



  // check usr existing
  const user = await User.findOne({email}).populate("additionalDetail");

  if(!user){
    return res.status(401).json({
      success:false,
      message:"User is Not Register,Please Sign-Up first"
    })
  }

  //generata JWT token , after matching password


  if(await bcrypt.compare(password,user.password)){

    const payload = {
      email : user.email,
      id : user._id,
      accountType:user.accountType,

    }
      const token =  jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"2h",
      })
  }





  // match creditional 







  }catch(error){



  }



  // sent response
}