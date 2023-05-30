require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Account = require("../../../Models/Account");
const { createToken } = require("../../../HelperFunctions/Token");
var Mixpanel = require("mixpanel");

var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
const maxAge = 3 * 24 * 60 * 60;

exports.signup = async (req, res) => {
  const { email, fullName, phoneNumber, password } = req.body;
  console.log("Checking for empty fields");
  if (
    !email ||
    email === "" ||
    !fullName ||
    fullName === "" ||
    !phoneNumber ||
    phoneNumber === "" ||
    !password ||
    password === ""
  ) {
    console.log("Empty fields found");
    return res.status(500).json({ message: "All fields must be field" });
  }

  // Check if User already exists
  console.log("Checking if user already exists");

  const existingStudent = await User.findOne({ email });
  if (existingStudent) {
    return res.status(500).json({ message: "Email already exists" });
  }

  // Checking if User Number is used
  console.log("Checking if user number has been used");

  const userNumber = await User.findOne({ phoneNumber });
  if (userNumber) {
    return res.status(500).json({ message: "Phone number already exists" });
  }

  // Hash the password
  console.log("Hashing Password");

  const saltRounds = 2;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Create the User
  console.log("Creating User");

  const user = new User({
    fullName,
    email,
    phoneNumber,
    setPin: false,
    password: hashedPassword,
    verificationStatus: true,
    updatedAt: Date.now(),
  });

  await user.save();
  mixpanel.track("Signed Up", {
    'id': user._id,
      'Type': "User"
  });
  console.log("New User Created");

  // Create new Account
  console.log(`Creating new account for: ${user._id}`);

  const account = new Account({
    ID: user._id,
    accountType: "User",
    balance: 0,
    pin: "",
    lastTransactionType: "Nan",
    lastTransactionAmount: 0,
  });

  await account.save();
  console.log("New Account Created");

  // Generate a JSON web token
  const token = createToken(user._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  //   sendOTP(user._id, phoneNumber);
  res.status(200).json({ token, user });
};
