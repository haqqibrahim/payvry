require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const Account = require("../../../Models/Account");
const { createToken } = require("../../../HelperFunctions/Token");
var Mixpanel = require("mixpanel");

var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);


const maxAge = 3 * 24 * 60 * 60;


exports.login = async (req, res) => {
  const { matricNumber, password } = req.body;
  if (!matricNumber || matricNumber === "" || !password || password === "") {
    return res.status(500).json({ message: "All fields must be field" });
  }

  // Check if User exists
  const student = await Student.findOne({ matricNumber });
  if (!student) {
    return res.status(500).json({ message: "Invalid matric number" });
  }

  const user = await User.findById({_id: student.ID})
  if (!user) {
    return res.status(500).json({ message: "user not found" });
  }
  // Check if password is correct
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(500).json({ message: "Invalid password" });
  }

  const userAccount = await Account.findOne({ ID: user._id });
  if (!userAccount) {
    return res.status(500).json({ message: "Account not found" });
  }

  if (!user.setPin) {
    return res.status(500).json({ message: "Transaction Pin no set!" });
  }

  // Generate a JSON web token
  const token = createToken(user._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  mixpanel.track("Login", {
    "id": user._id,
    "Type": "User",
  });
  res.json({ token, user });
};


