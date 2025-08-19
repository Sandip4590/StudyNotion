const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("bearer", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wronge While Validating the token",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "student") {
      return res.status(401).json({
        success: false,
        message: "This is Protected Route For Students Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role cannot be Verified",
    });
  }
};


exports.isInstructor = async(req, res) => {
  try{

    if(req.user.accountType !== "instructor"){
      return res.status(401).json({
        success:false,
        message:"This is Protected Route For Instructor Only"
      })
    }

  }catch(error){
    return res.status(500).json({
      success:false,
      message:"User Role Can Not Be Verified"
    })

  }
}

exports.isAdmin = async(req,res) =>{
  try{

    if(req.user.accountType !== "Admin"){
      return res.status(401).json({
        success:false,
        message:"This iS Protected Routes for Admin Only "
      })
    }

  }catch(error){
    return res.status(500).json({
      success:false,
      message:"User Role Can Not Be Verified"
    })
  }
}