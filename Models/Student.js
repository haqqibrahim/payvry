const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  matricNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
});


const Student = mongoose.model("Student", StudentSchema)
module.exports = Student
