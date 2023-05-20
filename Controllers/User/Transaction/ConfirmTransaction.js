require("dotenv").config();
const Vendor = require("../../../Models/Vendor");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const Account = require("../../../Models/Account");
const Transaction = require("../../../Models/Transaction");

// Aol
exports.confirmTransaction = async (req, res) => {
  try {
    const transaction_ref = req.params.id;
    const transactions = await Transaction.updateMany(
      { transaction_ref: transaction_ref },
      { transaction_status: "completed" }
    );

    console.log(`${transactions.nModified} transactions updated.`);
    await Account.updateOne(
      { _id: vendorAccount._id },
      {
        balance: newVendorBalance,
        lastTransactionType: "credit",
        lastTransactionAmount: amount,
      }
    );

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance: newUserBalance,
        lastTransactionType: "debit",
        lastTransactionAmount: amount,
      }
    );
;

    res.status(200).json({ message: "Transactions Competed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
