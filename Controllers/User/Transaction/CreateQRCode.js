require("dotenv").config();
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const fs = require("fs");
// API endpoint to generate a QR code and store user data
exports.createQRcode = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    const fullName = user.fullName;

    const student = await Student.findOne({ ID: user._id });
    if (!student) {
      return res.status(500).json({ message: "Student not found" });
    }
    const matricNumber = student.matricNumber;

    const data = `${fullName}, ${matricNumber}`;
    // Generate the QR code
    const qrCode = await QRCode.toDataURL(data);
    // Save the QR code as an image file
    const qrCodeBuffer = Buffer.from(qrCode.split(",")[1], "base64");
    fs.writeFileSync("qrcode.png", qrCodeBuffer);
    res.status(200).json({ qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
