const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  fullName: {type: String, require:true},
  matricNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: {type:String, required:true, unique: true},
  pin: {type: String},
  verificationStatus: {type: Boolean},
  balance: {type: Number},
  lastTransactionDate: {type:String}
});

const Student = mongoose.model('Students', StudentSchema);
module.exports = Student