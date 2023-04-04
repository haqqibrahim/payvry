const express = require('express');
const studentAuthController = require('../../Controllers/Student/StudentAuthController');

const router = express.Router();

router.post('/signup', studentAuthController.signup);
router.post('/login', studentAuthController.login);
router.post("/signout", studentAuthController.signout)
router.post("/setpin", studentAuthController.setPin)
module.exports = router;
