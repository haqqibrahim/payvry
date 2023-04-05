require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../../Models/Student");
const AdminDashboard = require("../../Models/AdminDashboard");

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};



exports.signup = async (req, res) => {
  const { matricNumber, fullName, phoneNumber, password } = req.body;
  if(!matricNumber || matricNumber === '' || !fullName || fullName === '' || !phoneNumber || phoneNumber === '' || !password || password === '') {
    return res.status(409).json({message: "Empty fields"})
  }
  
  // Check if Student already exists
  const existingStudent = await Student.findOne({ matricNumber });
  if (existingStudent) {
    return res.status(409).json({ message: "Matric Number already exists" });
  }
  const studentNumber  = await Student.findOne({phoneNumber})
  if(studentNumber) {
    return res.status(409).json({message: "Phone number already exists"})
  }
  // Hash the password
  const saltRounds = 15;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Create the Student
  const student = new Student({
    fullName,
    matricNumber,
    phoneNumber,
    password: hashedPassword,
    pin: "",
    verificationStatus: false,
    balance: 0,
  });
  await student.save();
  await AdminDashboard.updateOne({}, { $inc: { all_account_user: 1 } })
  // Generate a JSON web token
  const token = createToken(student._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.status(201).json({ token, student });
};

exports.login = async (req, res) => {
  const { matricNumber, password } = req.body;
  if(!matricNumber || matricNumber === '' || !password || password === '') {
    return res.status(409).json({message: "Empty fields"})
  }
  
  // Check if Student exists
  const student = await Student.findOne({ matricNumber });
  if (!student) {
    return res.status(401).json({ message: "Invalid matric number" });
  }

  // Check if password is correct
  const passwordMatch = await bcrypt.compare(password, student.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate a JSON web token
  const token = createToken(student._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.json({ token, student });
};

exports.signout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 }); // deleting the token from the cookies
  res.status(200).json({ message: "User logged out successfully" });
};

exports.setPin = async (req, res) => {
  try {
    const {pin} = req.body
    const token = req.cookies.jwt; // getting the token from the cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const studentId = decoded.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(400).json({ message: "User not found" });
    }
    const saltRounds = 15;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    await Student.updateOne({_id:studentId}, {pin:hashedPin})
    return res.status(200).json({message: "Pin set Successful"})
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};


