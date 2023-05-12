require("dotenv").config();
const jwt = require("jsonwebtoken");
const Student = require("../../Models/User");
const Transaction = require("../../Models/Transaction");
const Account = require("../../Models/Account");
function generateRandomString(length) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

exports.deposit = async (req, res) => {
  try {
    const { amount, transaction_ref, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId});
    if (!userAccount) {
      return res.status(409).json({ message: "Account not found" });
    }
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) + Number(amount);

    const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "deposit",
      accountType: "User",
      amount,
      transaction_ref,
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance,
        lastTransactionType: "deposit",
        lastTransactionAmount: amount,
      }
    );
    return res.status(200).json({ message: "Transaction Saved", transaction });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, transaction_ref, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
    if (!userAccount) {
      return res.status(409).json({ message: "Account not found" });
    }
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) - Number(amount);

    const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "withdraw",
      accountType: "User",
      amount,
      transaction_ref,
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance,
        lastTransactionType: "withdraw",
        lastTransactionAmount: amount,
      }
    );
    return res.status(200).json({ message: "Transaction Saved", transaction });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};

exports.balance = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
    if (!userAccount) {
      return res.status(409).json({ message: "Account not found" });
    }
    const balance = userAccount.balance;
    return res.status(200).json({ message: balance });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};

exports.history = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
    if (!userAccount) {
      return res.status(409).json({ message: "Account not found" });
    }
    const userTx = await Transaction.find({ ID: userAccount._id });
    return res.status(200).json({ message: userTx });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};
