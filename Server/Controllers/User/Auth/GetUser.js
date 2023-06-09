require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student")
const Transaction = require("../../../Models/Transaction");
const Account = require("../../../Models/Account");

exports.getUser = async (req, res) => {
  try {
    const { token } = req.body;

    // const token = req.cookies.jwt; // getting the token from the cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const student = await Student.findOne({ID: user._id})
    if (!student) {
      return res.status(500).json({message: "Student not found"})
    }
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const userTransaction = await Transaction.find({ ID: userAccount._id }).sort({ date: -1 });

    return res
      .status(200)
      .json({ message: "found user", user, student,userTransaction });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
