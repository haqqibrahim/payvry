const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  accountType: {
    type: String,
    enum: ["User", "Vendor"],
  },
  balance: {
    type: Number,
  },
  pin: {
    type: String,
  },
  lastTransaction_ref: {
    type: String,
  },
  lastTransactionType: {
    type: String,
    enum: ["deposit", "debit", "withdraw", "refund", "Nan"],
    default: "Nan"
  },
  lastTransactionAmount: {
    type: Number,
  },
});

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
