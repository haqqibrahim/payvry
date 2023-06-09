const express = require("express");

const { signout } = require("../../Controllers/User/Auth/Signout");
const { signup } = require("../../Controllers/User/Auth/Signup");
const {
  otpVerification,
} = require("../../Controllers/User/Auth/OTPVerification");
const { otpSend } = require("../../Controllers/User/Auth/OTPSend");
const { setPin } = require("../../Controllers/User/Auth/SetPin");
const { getUser } = require("../../Controllers/User/Auth/GetUser");
const { balance } = require("../../Controllers/User/Auth/Balance");
const { update } = require("../../Controllers/User/Auth/Update");
const { createStudent } = require("../../Controllers/User/Auth/CreateStudent");
const { login } = require("../../Controllers/User/Auth/Login");
const { verifyNumber } = require("../../Controllers/User/Auth/VerifyNumber");
const { verifyOTP } = require("../../Controllers/User/Auth/VerifyOtp");
const {
  SendOTP,
  VerifyOTP,
  ChangePassword,
} = require("../../Controllers/User/Auth/ForgetPassword");
const router = express.Router();

router.post("/verify-number", verifyNumber);
router.post("/verify-otp", verifyOTP);
router.post("/signup", signup);
router.post("/create-student", createStudent);
router.post("/verify-otp", otpVerification);
router.post("/send-otp", otpSend);
router.post("/login", login);
router.post("/signout", signout);
router.post("/setpin", setPin);
router.post("/user", getUser);
router.post("/balance", balance);
router.put("/update", update);
router.post("/update/send-reset-otp", SendOTP);
router.post("/update/verify-otp", VerifyOTP);
router.put("/update/change-password", ChangePassword);

module.exports = router;
