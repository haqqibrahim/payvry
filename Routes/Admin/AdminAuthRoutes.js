const express = require('express');
const adminAuthController = require('../../Controllers/Admin/AdminAuthController');

const router = express.Router();
router.post("/get", adminAuthController.today)
router.get("/dashboard", adminAuthController.dashboard)
router.post('/signup', adminAuthController.createPassword);
router.post('/login', adminAuthController.login);
router.post("/signout", adminAuthController.signout)
module.exports = router;
