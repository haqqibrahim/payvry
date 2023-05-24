const Student = require("../../../Models/Student");
const User = require("../../../Models/User");
const { sendOTP, verifyOTP } = require("../../../HelperFunctions/OTP");
const bcrypt = require("bcrypt");

exports.SendOTP = async (req, res) => {
  try {
    const { matricNumber } = req.body;
    const student = await Student.findOne({ matricNumber });
    if (!student) return res.status(500).json({ error: "Student not found" });
    const user = await User.findOne({ _id: student.ID });
    if (!user) return res.status(500).json({ error: "User not found" });
    const phoneNumber = user.phoneNumber;
    const respond = await sendOTP(phoneNumber);
    if (respond == "error") {
      return res.status(500).json({ message: "WhatsApp Error" });
    }
    res.status(200).json({ message: "OTP Sent to WhatsApp" });
  } catch (err) {
    res.status(501).json({ message: err });
    console.log(err);
  }
};

exports.VerifyOTP = async (req, res) => {
  try {
    const { matricNumber, otp } = req.body;
    const student = await Student.findOne({ matricNumber });
    if (!student) return res.status(500).json({ error: "Student not found" });
    const user = await User.findOne({ _id: student.ID });
    if (!user) return res.status(500).json({ error: "User not found" });
    const phoneNumber = user.phoneNumber;

    const { code, message } = await verifyOTP(phoneNumber, otp);

    if (code === 500) {
      return res.status(500).json({ message });
    }
    res.status(200).json({ message: "User Verified" });
  } catch (err) {
    res.status(501).json({ message: err });
    console.log(err);
  }
};

exports.ChangePassword = async (req, res) => {
  try {
    const { matricNumber, password } = req.body;
    const student = await Student.findOne({ matricNumber });
    if (!student) return res.status(500).json({ error: "Student not found" });

    const saltRounds = 2;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Update the user's password in the database
    const user = await User.findByIdAndUpdate(
      student.ID,
      { password: hashedPassword },
      { new: true }
    );
    if (!user) return res.status(500).json({ error: "User not found" });
   
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(501).json({ message: err });
    console.log(err);
  }
};
