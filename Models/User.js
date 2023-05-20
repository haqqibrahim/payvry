const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, require: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  setPin: { type: Boolean },
  verificationStatus: { type: Boolean },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
});

const User = mongoose.model("Users", UserSchema);
module.exports = User;
