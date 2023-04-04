const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  vendorName: {type: String, require:true},
  vendorUsername: { type: String, required: true, unique: true },
  vendorOwner: {type:String, required: true},
  password: { type: String, required: true },
  phoneNumber: {type:String, required:true, unique: true},
  pin: {type: String},
  verificationStatus: {type: Boolean},
  balance: {type: Number}
});

const Vendor = mongoose.model('Vendors', VendorSchema);
module.exports = Vendor