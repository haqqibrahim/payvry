const mongoose = require('mongoose');

// Define the schema for a Refund
const RefundSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    refund_ref: {
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
      enum: ['debit', 'credit','Nan','refund'],
      default: 'Nan'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  });
  
  // Create the model for a Refund
  const Refund = mongoose.model('RefundTransaction', RefundSchema);
  module.exports = Refund
  