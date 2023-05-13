const express = require('express');
const vendorAuthController = require('../../Controllers/Vendor/VendorAuthController');

const router = express.Router();

router.post('/signup', vendorAuthController.signup);
router.post('/login', vendorAuthController.login);
router.post("/signout", vendorAuthController.signout)
router.post("/setpin", vendorAuthController.setPin)
router.post("/vendor", vendorAuthController.getVendor)
router.post("/update",vendorAuthController.updateVendor)
router.post("/verify-otp", vendorAuthController.otpVerification)
router.post("/sent-otp", vendorAuthController.otpSend)
router.post("/balance", vendorAuthController.balance)
router.put("/update", vendorAuthController.update);

module.exports = router;
