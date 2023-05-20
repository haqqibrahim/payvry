require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const { sendOTP, verifyOTP } = require("../../../HelperFunctions/OTP");

// Send OTP
exports.otpSend = async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
  const userId = decoded.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const phoneNumber = user.phoneNumber;
  sendOTP(phoneNumber);
  res.status(200).json({ message: "OTP Sent to WhatsApp" });
};
