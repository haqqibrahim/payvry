require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const bcrypt = require("bcrypt");

exports.update = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
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

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
