require("dotenv").config();
const jwt = require("jsonwebtoken");
const Student = require("../../Models/Student");
const Transaction = require("../../Models/StudentTransactions");

function generateRandomString(length) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

exports.deposit = async (req, res) => {
  try {
    const { amount, transaction_ref,token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const studentId = decoded.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(409).json({ message: "User not found" });
    }
    const transaction = new Transaction({
      user_id: studentId,
      vendor: "top-up",
      amount,
      alert:"credit",
      status: "completed",
      transaction_ref,
    });
    await transaction.save();
    const oldBalance = student.balance;
    const newBalance = Number(oldBalance) + Number(amount);
   
    await Student.updateOne({ _id: studentId }, { balance: newBalance });
    return res.status(200).json({ message: "Transaction Saved", transaction });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};

exports.balance  = async (req, res) => {
    try {
       const {token} = req.body
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
        const studentId = decoded.id;
        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(409).json({ message: "User not found" });
        }
        const balance = student.balance
        return res.status(200).json({message: balance})
      } catch (err) {
        console.log(err);
        res.status(409).json({ message: err });
      }
}

exports.history = async (req, res) => {
    try {
        
       const {token} = req.body
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
        const studentId = decoded.id;
        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(409).json({ message: "User not found" });
        }
        const transactions = await Transaction.find({ user_id: studentId });
        console.log(transactions)
        return res.status(200).json({message: transactions})
      } catch (err) {
        console.log(err);
        res.status(409).json({ message: err });
      }
}
