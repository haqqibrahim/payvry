require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Vendor = require("../../Models/Vendor");
const Student = require("../../Models/Student");
const VendorTransaction = require("../../Models/VendorTransactions");
const StudentTransaction = require("../../Models/StudentTransactions");
const RefundTransaction = require("../../Models/RefundTransaction");
const TransactionPin = require("../../Models/TransactionPin");
const AdminDashboard = require("../../Models/AdminDashboard");

// Nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "enessyibrahim@gmail.com",
    pass: "zaggdflgzqjizzti",
  },
});
// Define a function to generate a CSV string from the transactions array
function generateCsv(transactions) {
  const headers = [
    "Datetime",
    "Transtaction-ref",
    "Amount",
    "Status",
    "Student",
    "Alert",
    "Vendor",
  ];
  const rows = transactions.map(
    ({ date_time, transtaction_ref, amount, status, student, alert }) => [
      date_time,
      transtaction_ref,
      amount,
      status,
      student,
      alert,
    ]
  );
  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

function generateRandomString(length) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

exports.balance = async (req, res) => {
  try {
    const {token} = req.body; // getting the token from the cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }
    const balance = vendor.balance;
    return res.status(200).json({ message: balance });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const { matricNumber,token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(409).json({ message: "Vendor not found" });
    }
    console.log("Vendor found");
    const student = await Student.find({ matricNumber });
    if (student.length == []) {
      return res.status(409).json({ message: "Matric Number not found" });
    }
    console.log(student[0]);
    const studentName = student[0].fullName;
    return res.status(200).json({ message: studentName });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.acceptPayment = async (req, res) => {
  try {
    const { matricNumber, amount, pin, token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(409).json({ message: "Vendor not found" });
    }
    const student = await Student.find({ matricNumber });
    if (student.length == []) {
      return res.status(409).json({ message: "Matric Number not found" });
    }

    if (student[0].balance < amount) {
      return res.status(409).json({ message: "Insufficient Funds" });
    }
    // Check if pin is correct
    const pinMatch = await bcrypt.compare(pin, student[0].pin);
    if (!pinMatch) {
      return res.status(401).json({ message: "Invalid pin" });
    }
    const transaction_ref = generateRandomString(20);

    const vendorTransaction = new VendorTransaction({
      user_id: vendorId,
      student: matricNumber,
      amount,
      alert: "credit",
      status: "completed",
      transaction_ref,
    });
    const oldVendorBalance = vendor.balance;
    const newVendorBalance = Number(oldVendorBalance) + Number(amount);

    const studentDebitAmount = Number(amount) + Number(10);
    const studentTransaction = new StudentTransaction({
      user_id: matricNumber,
      vendor: vendor.vendorUsername,
      amount: studentDebitAmount,
      alert: "debit",
      status: "completed",
      transaction_ref,
    });
    const oldStudentBalance = student[0].balance;
    const newStudentBalance =
      Number(oldStudentBalance) - Number(studentDebitAmount);

    await vendorTransaction.save();
    await studentTransaction.save();
    await Vendor.updateOne({ _id: vendorId }, { balance: newVendorBalance });
    await Student.updateOne(
      { _id: student[0]._id },
      { balance: newStudentBalance }
    );
      await AdminDashboard.updateOne({}, { $inc: { all_transactions: 1 } })
      await AdminDashboard.updateOne({}, { $inc: { all_profit_earned: 10 } })
      const currentDate = new Date().toISOString().slice(0, 10); // get current date in format 'YYYY-MM-DD'

      if(student[0].lastTransactionDate !== currentDate) {
        await Student.updateOne({_id: student[0]._id}, {lastTransactionDate: currentDate})
        await AdminDashboard.updateOne({}, { $inc: { active_users_today: 1 } })
      }
    return res
      .status(200)
      .json({ message: "Transaction Completed", vendorTransaction });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.verifyPin = async (req, res) => {
  try {
    const { pin, pinId, matricNumber, amount,token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(409).json({ message: "Vendor not found" });
    }
    const student = await Student.find({ matricNumber });
    if (student.length == []) {
      return res.status(409).json({ message: "Matric Number not found" });
    }
    if (!pin) {
      return res.status(400).json({
        message: "Empty Pin is not allowed, please check your email",
      });
    }
    const transactionPinRecords = await TransactionPin.find({ pinId });
    if (transactionPinRecords.length <= 0) {
      return res.status(400).json({
        message: "No Pin record found. Please try again",
      });
    }
    const { expiredAt } = transactionPinRecords[0];
    const hashedpin = transactionPinRecords[0].pin;
    if (expiredAt < Date.now()) {
      await TransactionPin.deleteMany({ pinId });
      return res.status(400).json({
        message: "Pin has expired. Please try again",
      });
    }
    const validPin = await bcrypt.compare(pin, hashedpin);
    if (validPin) {
      await TransactionPin.deleteMany({ pinId });
      const transaction_ref = generateRandomString(20);
      const token = req.cookies.jwt; // getting the token from the cookies
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
      const vendorId = decoded.id;
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(400).json({ message: "Vendor not found" });
      }
      const student = await Student.find({ matricNumber });
      if (student.length == []) {
        return res.status(400).json({ message: "Matric Number not found" });
      }
      const vendorTransaction = new VendorTransaction({
        user_id: vendorId,
        student: matricNumber,
        amount,
        alert: "credit",
        status: "completed",
        transaction_ref,
      });
      const oldVendorBalance = vendor.balance;
      const newVendorBalance = Number(oldVendorBalance) + Number(amount);

      const studentDebitAmount = Number(amount) + Number(10);
      const studentTransaction = new StudentTransaction({
        user_id: matricNumber,
        vendor: vendor.vendorUsername,
        amount: studentDebitAmount,
        alert: "debit",
        status: "completed",
        transaction_ref,
      });
      const oldStudentBalance = student[0].balance;
      const newStudentBalance =
        Number(oldStudentBalance) - Number(studentDebitAmount);

      await vendorTransaction.save();
      await studentTransaction.save();
      await Vendor.updateOne({ _id: vendorId }, { balance: newVendorBalance });
      await Student.updateOne(
        { _id: student[0]._id },
        { balance: newStudentBalance }
      );
      return res
        .status(200)
        .json({ message: "Transaction Completed", vendorTransaction });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.refund = async (req, res) => {
  try {
    const { matricNumber, amount, transaction_ref,token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }
    const student = await Student.find({ matricNumber });
    if (student.length == []) {
      return res.status(400).json({ message: "Matric Number not found" });
    }
    const refund_ref = "Refund-" + transaction_ref;
    const refundTransaction = new RefundTransaction({
      user_id: vendorId,
      student: matricNumber,
      amount,
      alert: "refund",
      status: "completed",
      refund_ref,
    });
    const oldVendorBalance = vendor.balance;
    const newVendorBalance = Number(oldVendorBalance) - Number(amount);

    const studentTransaction = new StudentTransaction({
      user_id: matricNumber,
      vendor: vendor.vendorUsername,
      amount,
      alert: "refund",
      status: "completed",
      transaction_ref: refund_ref,
    });

    const oldStudentBalance = student[0].balance;
    const newStudentBalance = Number(oldStudentBalance) + Number(amount);

    await refundTransaction.save();
    await studentTransaction.save();
    await Vendor.updateOne({ _id: vendorId }, { balance: newVendorBalance });
    await Student.updateOne(
      { _id: student[0]._id },
      { balance: newStudentBalance }
    );
    return res
      .status(200)
      .json({ message: "Refund Completed", refundTransaction });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.history = async (req, res) => {
  try {
    const { email,token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }
    const transactions = await VendorTransaction.find({ user_id: vendorId });
    let mailOptions = {
      from: "enessyibrahim@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Payvry Account Statement", // Subject line
      text: "Please find the attached Payvry statement.", // plain text body
      attachments: [
        {
          filename: "statement.csv",
          content: generateCsv(transactions),
        },
      ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        res.status(500).send("Failed to send the statement.");
      }
      console.log("Email sent:", info.response);
      return res.status(200).json({ message: "Statement sent" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.funds = async (req, res) => {
  try {
    await VendorTransaction.deleteMany({ refund_ref: null });
    res.status(200).json({ message: "We good" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, transaction_ref,token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(409).json({ message: "Vendor not found" });
    }
     const oldVendorBalance = vendor.balance;
    const newVendorBalance = Number(oldVendorBalance) - Number(amount);

    const transaction = new VendorTransaction({
      user_id: vendorId,
      student: "Null",
      amount,
      alert: "withdraw",
      status: "completed",
      transaction_ref,
    });
    await transaction.save();
     await Vendor.updateOne({ _id: vendorId }, { balance: newVendorBalance });
    return res.status(200).json({ message: "Withdraw Succesful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
