const User = require("../models/User")
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator")

//otp send 
exports.sendOtp = async (req,res) => {
    {
        try{

            //fetch data from req ki body

            const {email} = req.body;

            //check user if exist

            const checkUserPresent = await User.findOne({email});

            // if user exist then return response

            if(checkUserPresent){
                return res.status(401).json({
                    success:false,
                    message:"User Already Exist"
                })
            }

            // generate OTP

            var otp = 


        }catch(e){



            




        }
    }
}
