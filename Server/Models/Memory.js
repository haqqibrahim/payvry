// Import Deps
const mongoose = require("mongoose");

// Model Schema

// Messages Model Schema
const memoryMsgWASchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"]
  },
  content: {
    type: String,
  },
});

// Chats Model Schema
const MemorySchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
  },
  messages: [memoryMsgWASchema],
});

const Memory = mongoose.model("Memory", MemorySchema);
module.exports = Memory;
