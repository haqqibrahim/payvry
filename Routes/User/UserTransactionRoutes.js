const express = require('express');
const userTransactionController = require('../../Controllers/User/UserTransactionController');

const router = express.Router();

router.post("/deposit", userTransactionController.deposit)
router.post("/balance", userTransactionController.balance)
router.post("/history", userTransactionController.history)
router.post("/withdraw", userTransactionController.withdraw);
router.post("/bank", userTransactionController.verifyBank);
module.exports = router