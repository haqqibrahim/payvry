require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Vendor = require("../../Models/Vendor");


// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};



exports.signup = async (req, res) => {
  const { vendorUsername, vendorName,vendorOwner, phoneNumber, password } = req.body;
   if(!vendorUsername || vendorUsername === '' || !vendorName || vendorName === '' || !vendorOwner || vendorOwner === '' || !phoneNumber || phoneNumber === '' || !password || password === '') {
    return res.status(409).json({message: "All fields must be field"})
  }
  // Check if Vendor already exists
  const existingVendor = await Vendor.findOne({ vendorUsername });
  if (existingVendor) {
    return res.status(409).json({ message: "Vednor already exists" });
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
    pin: "",
    verificationStatus: false,
    balance: 0,
  });
  await vendor.save();
  // Generate a JSON web token
  const token = createToken(vendor._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.status(201).json({ token, vendor });
};

exports.login = async (req, res) => {
  const {vendorUsername, password } = req.body;
 if(!vendorUsername || vendorUsername === '' ||  !password || password === '') {
    return res.status(409).json({message: "All fields must be field"})
  }
  // Check if Vendor exists
  const vendor = await Vendor.findOne({ vendorUsername });
  if (!vendor) {
    return res.status(4019).json({ message: "Vendor not found" });
  }

  // Check if password is correct
  const passwordMatch = await bcrypt.compare(password, vendor.password);
  if (!passwordMatch) {
    return res.status(409).json({ message: "Invalid password" });
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
    const {pin, token} = req.body
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }
    await vendor.updateOne({_id:vendorId}, {pin})
    return res.status(200).json({message: "Pin set Successful"})
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};


