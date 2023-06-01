require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student")
const bcrypt = require("bcrypt");

exports.update = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    user.fullName = req.body.fullName || user.fullName;
    user.matricNumber = req.body.matricNumber || user.matricNumber;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    if (req.body.password) {
      const saltRounds = 2;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      user.password = hashedPassword;
    }

    user.updatedAt = Date.now();
    await user.save(); // Save the updated user

    // Update matricNumber in the Student model
    const student = await Student.findOne({ ID: userId });
    if (student) {
      student.matricNumber = req.body.matricNumber || student.matricNumber;
      await student.save(); // Save the updated student
    }

  return  res.status(200).json({message: "Profile update successful"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
