const express = require('express');
const studentTransactionController = require('../../Controllers/Student/StudentTransactionController');

const router = express.Router();

router.post("/deposit", studentTransactionController.deposit)
router.post("/balance", studentTransactionController.balance)
router.post("/history", studentTransactionController.history)
module.exports = router