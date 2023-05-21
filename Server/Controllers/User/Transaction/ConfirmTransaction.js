require("dotenv").config();
const Vendor = require("../../../Models/Vendor");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const Account = require("../../../Models/Account");
const Transaction = require("../../../Models/Transaction");

// Aolcls
exports.confirmTransaction = async (req, res) => {
  try {
    const transaction_ref = req.params.id;
    await Transaction.updateMany(
      { transaction_ref: transaction_ref },
      { status: "completed" }
    );

    const tx = await Transaction.find({ transaction_ref });
    const vendorId = tx[0].ID;
   

    const vendorAccount = await Account.findById({ _id: vendorId });

    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor Account not found" });
    }
    const userId = tx[1].ID;

    const userAccount = await Account.findOne({ _id: userId });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    console.log("Updating.......................");
    await Account.updateOne(
      { _id: vendorAccount._id },
      {
        balance: tx[0].balance,
        lastTransactionType: "credit",
        lastTransactionAmount: tx[0].amount,
      }
    );

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance: tx[1].balance,
        lastTransactionType: "debit",
        lastTransactionAmount: tx[1].amount,
      }
    );
    res.status(200).json({ message: "Transactions Competed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
