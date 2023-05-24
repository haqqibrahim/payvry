require("dotenv").config();
const { verifyOTP } = require("../../../HelperFunctions/OTP");


exports.verifyOTP = async (req, res) => {
  const { phoneNumber,otp } = req.body;
 
  const { code, message } = await verifyOTP(phoneNumber, otp);

  if (code === 500) {
    return res.status(500).json({ message });
  }

  return res.status(200).json({message})
 
};
