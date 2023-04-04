require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../../Models/Admin");
const AdminDashboard = require("../../Models/AdminDashboard");
const TodayTransaction = require("../../Models/TodayTransaction");
const VendorTransaction = require("../../Models/VendorTransactions");

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};


exports.dashboard = async (req, res) => {
  const currentDate = new Date().toISOString().slice(0, 10); // get current date in format 'YYYY-MM-DD'

  const tx = VendorTransaction.find({ date: currentDate });
  console.log(tx)
  console.log(tx.length)
  const profit = tx.lenght * 10;
  console.log(profit)
  // await AdminDashboard.updateMany({}, { transaction_today: tx.lenght });
  // await AdminDashboard.updateMany({}, { profit_today: Number(profit) });

  // const dashboardData = await AdminDashboard.find({});
  // res.status(200).json({message: dashboardData})
};


exports.today = async (req, res) => {
  const {id} = req.body
  console.log(id)
  const todayTx = new TodayTransaction({
    usersTransaction: 0,
    amountProcessedToday: 0,
    profitToday: 0,
  });
  await todayTx.save();
  res.status(200).json({message: todayTx})
};
exports.createPassword = async (req, res) => {
  const { id, password } = req.body;
  // Hash the password
  const saltRounds = 15;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const admin = new Admin({
    id,
    password: hashedPassword,
  });
  const adminDashboard = new AdminDashboard({
    all_account_user: 0,
    all_transactions: 0,
    all_profit_earned: 0,
    active_users_today: 0,
    transaction_today: 0,
    profit_today: 0,
  });

  await admin.save();
  await adminDashboard.save();
  // Generate a JSON web token
  const token = createToken(admin._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.status(201).json({ admin });
};

exports.login = async (req, res) => {
  const { password } = req.body;

  const admin = await Admin.findOne({ id: "admin" });
  if (!admin) {
    return res.status(401).json({ message: "Invalid Id" });
  }

  // Check if password is correct
  const passwordMatch = await bcrypt.compare(password, admin.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }
  // Generate a JSON web token
  const token = createToken(admin._id);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  res.json({ token, admin });
};

exports.signout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 }); // deleting the token from the cookies
  res.status(200).json({ message: "Admin logged out successfully" });
};
