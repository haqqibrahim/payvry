require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Transaction = require("../../../Models/Transaction");
const Account = require("../../../Models/Account");
const { charge } = require("../../../Flutterwave/InitiateCharge");
const { generateRandomString } = require("../../../HelperFunctions/Reference");

exports.deposit = async (req, res) => {
  try {
    const { amount, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const email = user.email;
    const name = user.fullName
    const phone_number = user.phoneNumber
    const tx_ref = await generateRandomString(25);
    const depositResponse = await charge(amount, email,  phone_number,tx_ref);
    const { code, message, transfer_details } = depositResponse;
    console.log(transfer_details)
    if (code === 500) {
      return res.status(code).json({ message });
    }
    const userAccount = await Account.findOne({ID: user._id})
    if (!userAccount) {
      console.log("Account not found");
      return res.status(500).json({ message: "Account not found" });
    }
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) + Number(amount);

       const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "credit",
      accountType: "User",
      amount,
      transaction_ref:tx_ref,
      status: "pending",
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();
    console.log(`Transaction Pending: ${transaction}`)
    return res.status(code).json({ message, transfer_details });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
