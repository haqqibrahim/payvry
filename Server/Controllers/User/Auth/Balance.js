require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Account = require("../../../Models/Account");


exports.balance = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      return res.status(409).json({ message: "Account not found" });
    }
    const balance = userAccount.balance;
    return res.status(200).json({ message: balance });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};
