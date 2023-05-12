const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  code: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Otp = mongoose.model("OTP", otpSchema);
module.exports = Otp;
