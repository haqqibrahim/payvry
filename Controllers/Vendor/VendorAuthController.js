require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Vendor = require("../../Models/Vendor");
const Account = require("../../Models/Account");
const Transaction = require("../../Models/Transaction")
const { sendOTP, verifyOTP } = require("../../HelperFunctions/OTP");

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const { createToken } = require("../../HelperFunctions/Token");

exports.signup = async (req, res) => {
  const { vendorUsername, vendorName, vendorOwner, phoneNumber, password } =
    req.body;
  if (
    !vendorUsername ||
    vendorUsername === "" ||
    !vendorName ||
    vendorName === "" ||
    !vendorOwner ||
    vendorOwner === "" ||
    !phoneNumber ||
    phoneNumber === "" ||
    !password ||
    password === ""
  ) {
    return res.status(500).json({ message: "All fields must be field" });
  }
  // Check if Vendor already exists
  const existingVendor = await Vendor.findOne({ vendorUsername });
  if (existingVendor) {
    return res.status(500).json({ message: "Vednor already exists" });
  }
  const existingNumber = await Vendor.findOne({ phoneNumber });
  if (existingNumber) {
    return res
      .status(500)
      .json({ message: "Phone Number has been used already" });
  }
  // Hash the password
  const saltRounds = 15;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Create the Vendor
  const vendor = new Vendor({
    vendorUsername,
    vendorName,
    vendorOwner,
    phoneNumber,
    password: hashedPassword,
    setPin: false,
    verificationStatus: false,
    updatedAt: Date.now(),
  });
  await vendor.save();

  const account = new Account({
    ID: vendor._id,
    accountType: "Vendor",
    balance: 0,
    pin: "",
    lastTransactionType: "Nan",
    lastTransactionAmount: 0,
  });

  await account.save();
  console.log("New Account Created");
  // Generate a JSON web token
  const token = createToken(vendor._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  // sendOTP(vendor._id, phoneNumber);
  res.status(201).json({ token, vendor });
};

// Send OTP
exports.otpSend = async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
  const vendorId = decoded.id;
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return res.status(500).json({ message: "Vendor not found" });
  }
  const phoneNumber = vendor.phoneNumber;
  sendOTP(vendorId, phoneNumber);
  res.status(200).json({ message: "OTP Sent to WhatsApp" });
};

// Verify Phone Number
exports.otpVerification = async (req, res) => {
  try {
    const { otp, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    console.log(decoded);
    const vendorId = decoded.id;
    const { code, message } = await verifyOTP(vendorId, otp, "Vendor");
    res.status(code).json({ message });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.login = async (req, res) => {
  const { vendorUsername, password } = req.body;
  if (
    !vendorUsername ||
    vendorUsername === "" ||
    !password ||
    password === ""
  ) {
    return res.status(500).json({ message: "All fields must be field" });
  }
  // Check if Vendor exists
  const vendor = await Vendor.findOne({ vendorUsername });
  if (!vendor) {
    return res.status(4019).json({ message: "Vendor not found" });
  }

  const vendorAccount = await Account.findOne({ ID: vendor._id });
  if (!vendorAccount) {
    return res.status(500).json({ message: "Account not found" });
  }

  if (!vendor.setPin) {
    return res.status(500).json({ message: "Transaction Pin not set!" });
  }

  // Check if password is correct
  const passwordMatch = await bcrypt.compare(password, vendor.password);
  if (!passwordMatch) {
    return res.status(500).json({ message: "Invalid password" });
  }

  // Generate a JSON web token
  const token = createToken(vendor._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.json({ token, vendor });
};

exports.signout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 }); // deleting the token from the cookies
  res.status(200).json({ message: "User logged out successfully" });
};

exports.setPin = async (req, res) => {
  try {
    const { pin, token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    const saltRounds = 15;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    await Account.updateOne({ ID: vendorId }, { pin: hashedPin });
    await Vendor.updateOne(
      { _id: vendorId },
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

exports.getVendor = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    const vendorAccount = await Account.findOne({ ID: vendor._id });
    if (!vendorAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const vendorTransaction = await Transaction.find({ ID: vendorAccount._id });

    return res
      .status(200)
      .json({ message: "found vendor", vendor, vendorTransaction });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const {
      vendorName,
      vendorUsername,
      vendorNumber,
      phoneNumber,
      vendorOwner,
      password,
      token,
    } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    if (vendor.vendorUsername !== vendorUsername) {
      const existingVendor = await Vendor.findOne({ vendorUsername });
      if (existingVendor) {
        return res.status(500).json({ message: "Vednor already exists" });
      }
    }
    if (vendor.phoneNumber != phoneNumber) {
      console.log(vendor.phoneNumber);
      console.log(phoneNumber);
      const existingNumber = await Vendor.findOne({ phoneNumber });
      if (existingNumber) {
        return res
          .status(500)
          .json({ message: "Phone Number has been used already" });
      }
    }
    const saltRounds = 15;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await Vendor.update(
      { _id: vendorId },
      {
        vendorName,
        vendorUsername,
        vendorNumber,
        phoneNumber,
        vendorOwner,
        password: hashedPassword,
      }
    );
    const vendorUpdates = await Vendor.findById(vendorId);
    return res
      .status(200)
      .json({ message: "Vendor Details Updated", vendor: vendorUpdates });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.balance = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "User not found" });
    }
    const vendorAccount = await Account.findOne({ ID: vendor._id });
    if (!vendorAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const balance = vendorAccount.balance;
    return res.status(200).json({ message: balance });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.update = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "User not found" });
    }

    // update vendor fields
    vendor.vendorName = req.body.vendorName || vendor.vendorName;
    vendor.vendorUsername = req.body.vendorUsername || vendor.vendorUsername;
    vendor.vendorOwner = req.body.vendorOwner || vendor.vendorOwner;
    vendor.password = req.body.password || vendor.password;
    vendor.phoneNumber = req.body.phoneNumber || vendor.phoneNumber;
    vendor.updatedAt = Date.now();

    const updatedVendor = await vendor.save();

    res.status(200).json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
