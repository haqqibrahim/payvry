require("dotenv").config();
const jwt = require("jsonwebtoken");
const Vendor = require("../../../Models/Vendor");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const Account = require("../../../Models/Account");
const Transaction = require("../../../Models/Transaction");
const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");

function generateRandomString(length) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

exports.initiateTx = async (req, res) => {
  try {
    const { token, matricNumber, amount } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    const vendorAccount = await Account.findOne({ ID: vendor._id });
    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor account not found" });
    }
    const student = await Student.findOne({ matricNumber });
    if (!student) {
      return res.status(500).json({ message: "Student not found" });
    }
    const user = await User.findOne({ _id: student.ID });
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      return res.status(500).json({ message: "Student account not found" });
    }
    const debitAmount = Number(amount) + 10;

    if (userAccount.balance < debitAmount) {
      return res.status(500).json({ message: "Insufficient Funds" });
    }

    const transaction_ref = generateRandomString(10);
    const oldVendorBalance = vendorAccount.balance;
    const newVendorBalance = Number(oldVendorBalance) + Number(amount);

    const vendorTransaction = new Transaction({
      ID: vendorAccount._id,
      transactionType: "credit",
      accountType: "Vendor",
      amount,
      transaction_ref,
      transaction_fee: 0,
      transaction_status: "pending",
      user: matricNumber,
      balance: newVendorBalance,
      date: Date.now(),
      created_at: Date.now(),
    });
    const oldUserBalance = userAccount.balance;
    const newUserBalance = Number(oldUserBalance) - Number(debitAmount);

    const userTransaction = new Transaction({
      ID: userAccount._id,
      transactionType: "debit",
      accountType: "User",
      amount,
      transaction_ref,
      transaction_fee: 10,
      vendor: vendor.vendorUsername,
      balance: newUserBalance,
      transaction_status: "pending",
      date: Date.now(),
      created_at: Date.now(),
    });
    await vendorTransaction.save();
    await userTransaction.save();

    const link = `https://cd31-154-113-158-227.ngrok-free.app/user/api/confirm/${transaction_ref}`;


    const template = `Confirm ${vendor.vendorName}'s charge of ${amount} naira, ${link}`;
    
    const message = await sendMessage(template, user.phoneNumber);
    res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
