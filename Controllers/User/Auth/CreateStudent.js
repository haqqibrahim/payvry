require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
exports.createStudent = async (req, res) => {
  try {
    const { token, matricNumber, department, level } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const existingStudent = await User.findOne({ matricNumber });
    if (existingStudent) {
      return res.status(500).json({ message: "Matric Number already exists" });
    }
    const student = new Student({
      ID: user._id,
      matricNumber,
      department,
      level,
    });

    await student.save();
    res.status(200).json({ message: "We Good" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
