const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  id: { type: String, require: true, unique: true },
  password: { type: String, require: true, unique: true },
});

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
