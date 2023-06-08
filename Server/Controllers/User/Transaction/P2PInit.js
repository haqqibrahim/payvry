require("dotenv").config();
const jwt = require("jsonwebtoken");
const Vendor = require("../../../Models/Vendor");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const Account = require("../../../Models/Account");
const Transaction = require("../../../Models/Transaction");
var Mixpanel = require("mixpanel");

var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

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



exports.P2PInit = async (recipientNumber, phoneNumber, amount) => {
  try {

    const receiver = await User.findOne({ phoneNumber: recipientNumber });
    console.log("1")
    if (!receiver) {
      await sendMessage("Error in making payments, recipient not found", phoneNumber);
      console.log("Vendor not found");
      return;
    }
    console.log(receiver.fullName)
    const receiverStudent = await Student.findOne({ ID: receiver._id});
    console.log("5b")

    if (!receiverStudent) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }
    const receiverAccount = await Account.findOne({ ID: receiver._id });
    console.log("2")

    if (!receiverAccount) {
      console.log("Could not find vendor")
      await sendMessage("Error in making payments, could not find reciever", phoneNumber);
      return;
    }
    const user = await User.findOne({ phoneNumber });
    console.log("3")

    if (!user) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }
    const userAccount = await Account.findOne({ ID: user._id });
    console.log("4")

    if (!userAccount) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);

      return;
    }
    const student = await Student.findOne({ ID: user._id });
    console.log("5")

    if (!student) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }

    const debitAmount = Number(amount) + 0;

    if (userAccount.balance < debitAmount) {
      console.log("6")

      await sendMessage("Opps, Insufficient Funds", phoneNumber);
      return;
    }

    const transaction_ref = generateRandomString(10);
    const oldVendorBalance = receiverAccount.balance;
    const newVendorBalance = Number(oldVendorBalance) + Number(amount);

    const receiverTransaction = new Transaction({
      ID: receiverAccount._id,
      transactionType: "credit",
      accountType: "User",
      amount,
      transaction_ref,
      transaction_fee: 0,
      status: "pending",
      user: student.matricNumber,
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
      transaction_fee: 0,
      vendor: receiverStudent.matricNumber,
      balance: newUserBalance,
      transaction_status: "pending",
      date: Date.now(),
      created_at: Date.now(),
    });
    await receiverTransaction.save();
    await userTransaction.save();

    const link = `https://payvry.onrender.com/user/api/p2p/confirm/${transaction_ref}`;

    const template = `Confirm the payment of Naira ${amount} to ${receiver.fullName} ${link}`;
    console.log("7")

    await sendMessage(template, user.phoneNumber);
    mixpanel.track("Initiate Transaction", {
      id: transaction_ref,
      "User ID": user._id,
      "Vendor ID": receiver._id,
    });
    mixpanel.track("Payment Pending", {
      amount,
    });
  } catch (error) {
    console.error(`Initiate P2P error: ${error}`);

    await sendMessage("Something went wrong", phoneNumber);
  }
};
