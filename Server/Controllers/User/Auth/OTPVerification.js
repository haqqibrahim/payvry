require("dotenv").config();
const jwt = require("jsonwebtoken");
const { verifyOTP } = require("../../../HelperFunctions/OTP");

// Verify Phone Number
exports.otpVerification = async (req, res) => {
  try {
    const { otp, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    console.log(decoded);
    const userID = decoded.id;
    const { code, message } = await verifyOTP(userID, otp, "User");
    res.status(code).json({ message });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
