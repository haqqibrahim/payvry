const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  vendorName: { type: String, require: true },
  vendorUsername: { type: String, required: true, unique: true },
  vendorOwner: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  setPin: { type: Boolean },
  verificationStatus: { type: Boolean },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date },
});

const Vendor = mongoose.model('Vendors', VendorSchema);
module.exports = Vendor