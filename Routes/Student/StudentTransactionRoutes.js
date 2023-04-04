const express = require('express');
const studentTransactionController = require('../../Controllers/Student/StudentTransactionController');

const router = express.Router();

router.post("/deposit", studentTransactionController.deposit)
router.get("/balance", studentTransactionController.balance)
router.get("/history", studentTransactionController.history)
module.exports = router