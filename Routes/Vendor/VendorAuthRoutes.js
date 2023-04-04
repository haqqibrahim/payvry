const express = require('express');
const vendorAuthController = require('../../Controllers/Vendor/VendorAuthController');

const router = express.Router();

router.post('/signup', vendorAuthController.signup);
router.post('/login', vendorAuthController.login);
router.post("/signout", vendorAuthController.signout)
router.post("/setpin", vendorAuthController.setPin)
module.exports = router;
