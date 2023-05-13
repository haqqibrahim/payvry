const express = require('express');
const UserAuthController = require('../../Controllers/User/UserAuthController');

const router = express.Router();

router.post('/signup', UserAuthController.signup);
router.post("/verify-otp", UserAuthController.otpVerification);
router.post("/send-otp", UserAuthController.otpSend)
router.post('/login', UserAuthController.login);
router.post("/signout", UserAuthController.signout)
router.post("/setpin", UserAuthController.setPin)
router.post("/user", UserAuthController.getStudent)
router.post("/balance", UserAuthController.balance);
router.put("/update", UserAuthController.update)
module.exports = router;
