require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");

exports.update = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }

    // update user fields
    user.fullName = req.body.fullName || user.fullName;
    user.matricNumber = req.body.matricNumber || user.matricNumber;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.password = req.body.password || user.password;
    user.updatedAt = Date.now();

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
