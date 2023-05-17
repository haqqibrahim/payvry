const express = require('express');
const vendorTransactionController = require('../../Controllers/Vendor/VendorTransactionController');

const router = express.Router();

router.post("/balance", vendorTransactionController.balance)
router.post("/getstudent", vendorTransactionController.getStudent)
router.post("/acceptpayment", vendorTransactionController.acceptPayment)
router.post("/refund", vendorTransactionController.refund)
router.post("/history", vendorTransactionController.history)
router.post("/withdraw", vendorTransactionController.withdraw)
router.post("/bank", vendorTransactionController.verifyBank);
module.exports = router