require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const { sendOTP } = require("../../../HelperFunctions/OTP");

// Send OTP
exports.verifyNumber = async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await User.findOne({phoneNumber});
  if (user) {
    return res.status(400).json({ message: "Phone Number has been used" });
  }
  sendOTP( phoneNumber);
  res.status(200).json({ message: "OTP Sent to WhatsApp" });
};
