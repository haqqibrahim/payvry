const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionPinSchema = new Schema({
  pinId: {
    type: String,
  },
  pin: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  expiredAt: {
    type: Date,
  },
});

const transactionPin = mongoose.model("TransactionPin", transactionPinSchema);
module.exports = transactionPin;