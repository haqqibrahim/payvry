const mongoose = require('mongoose');

// Define the schema for a transaction
const transactionSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    transaction_ref: {
      type: String,
      required: true,
      unique: true
    },
   
    student: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date_time: {
      type: Date,
      default: Date.now
    },
    alert: {
      type: String,
      enum: ['debit', 'credit','Nan','refund', 'withdraw'],
      default: 'Nan'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  });
  
  // Create the model for a transaction
  const Transaction = mongoose.model('VendorTransactions', transactionSchema);
  module.exports = Transaction
  