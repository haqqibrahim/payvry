const express = require("express");
const userTransactionController = require("../../Controllers/User/UserTransactionController");

const {
  createQRcode,
} = require("../../Controllers/User/Transaction/CreateQRCode");
const {
  confirmTransaction,
} = require("../../Controllers/User/Transaction/ConfirmTransaction");

const {
  deposit,
} = require("../../Controllers/User/Transaction/InitiateDeposit");
const {confirmDeposit} = require(
  "../../Controllers/User/Transaction/ConfirmDeposit"
)
const router = express.Router();

// router.post("/deposit", userTransactionController.deposit);
router.post("/balance", userTransactionController.balance);
router.post("/history", userTransactionController.history);
router.post("/withdraw", userTransactionController.withdraw);
router.post("/bank", userTransactionController.verifyBank);

router.post("/qrcode", createQRcode);
router.get("/confirm/:id", confirmTransaction);
router.get("/deposit", deposit)
router.post("/flw-webhook", confirmDeposit)
module.exports = router;
