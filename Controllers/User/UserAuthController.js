require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../Models/User");
const Account = require("../../Models/Account");
const { sendOTP, verifyOTP } = require("../../HelperFunctions/OTP");
const { createToken } = require("../../HelperFunctions/Token");
const maxAge = 3 * 24 * 60 * 60;

exports.signup = async (req, res) => {
  const { matricNumber, fullName, phoneNumber, password } = req.body;
  console.log("Checking for empty fields");
  if (
    !matricNumber ||
    matricNumber === "" ||
    !fullName ||
    fullName === "" ||
    !phoneNumber ||
    phoneNumber === "" ||
    !password ||
    password === ""
  ) {
    console.log("Empty fields found");
    return res.status(409).json({ message: "All fields must be field" });
  }

  // Check if User already exists
  console.log("Checking if user already exists");

  const existingStudent = await User.findOne({ matricNumber });
  if (existingStudent) {
    return res.status(409).json({ message: "Matric Number already exists" });
  }

  // Checking if User Number is used
  console.log("Checking if user number has been used");

  const userNumber = await User.findOne({ phoneNumber });
  if (userNumber) {
    return res.status(409).json({ message: "Phone number already exists" });
  }
  // Hash the password
  console.log("Hashing Password");

  const saltRounds = 15;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Create the User
  console.log("Creating User");

  const user = new User({
    fullName,
    matricNumber,
    phoneNumber,
    setPin: false,
    password: hashedPassword,
    verificationStatus: false,
    updatedAt: Date.now(),
  });

  await user.save();
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
  sendOTP(user._id, phoneNumber);
  res.status(200).json({ token, user });
};

// Send OTP
exports.otpSend = async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
  const userId = decoded.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const phoneNumber = user.phoneNumber;
  // sendOTP(userId, phoneNumber);
  res.status(200).json({ message: "OTP Sent to WhatsApp" });
};

// Verify Phone Number
exports.otpVerification = async (req, res) => {
  try {
    const { otp, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    console.log(decoded);
    const userID = decoded.id;
    const { code, message } = await verifyOTP(userID, otp, "User");
    res.status(code).json({ message });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.setPin = async (req, res) => {
  try {
    const { pin, token } = req.body;
    if (pin.length < 6) {
      return res.status(400).json({ message: "Pin must be 6 digit" });
    }

    // const token = req.cookies.jwt; // getting the token from the cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const saltRounds = 15;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    await Account.updateOne(
      { ID: userId },
      { pin: hashedPin, verificationStatus: true }
    );
    await User.updateOne(
      { _id: userId },
      {
        setPin: true,
      }
    );
    return res.status(200).json({ message: "Pin set Successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.login = async (req, res) => {
  const { matricNumber, password } = req.body;
  if (!matricNumber || matricNumber === "" || !password || password === "") {
    return res.status(500).json({ message: "All fields must be field" });
  }

  // Check if User exists
  const user = await User.findOne({ matricNumber });
  if (!user) {
    return res.status(500).json({ message: "Invalid matric number" });
  }

  // Check if password is correct
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(500).json({ message: "Invalid password" });
  }

  const userAccount = await Account.findOne({ ID: user._id });
  if (!userAccount) {
    return res.status(409).json({ message: "Account not found" });
  }

  if (!user.setPin) {
    return res.status(409).json({ message: "Transaction Pin no set!" });
  }

  // Generate a JSON web token
  const token = createToken(user._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.json({ token, user });
};

exports.signout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 }); // deleting the token from the cookies
  res.status(200).json({ message: "User logged out successfully" });
};

exports.getStudent = async (req, res) => {
  try {
    const { token } = req.body;

    // const token = req.cookies.jwt; // getting the token from the cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      return res.status(409).json({ message: "Account not found" });
    }
    const userTransactions = await Transaction.find({ ID: userAccount._id });

    return res
      .status(200)
      .json({ message: "found user", user, userTransactions });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

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
