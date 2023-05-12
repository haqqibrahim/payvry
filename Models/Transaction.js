const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  transactionType: {
    type: String,
    enum: ["deposit", "debit", "withdraw", "refund", "credit"],
  },
  accountType: {
    type: String,
    enum: ["User", "Vendor"],
  },
  amount: {
    type: Number,
  },
  transaction_ref: {
    type: String,
  },
  balance: {
    type: Number,
  },
  date: {
    type: Date,
  },
  created_at: {
    type: Date,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
