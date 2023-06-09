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

exports.DinnerInit = async (phoneNumber) => {
  try {
    const vendor = await Vendor.findOne({ vendorUsername: "dinner" });
    console.log("1");
    if (!vendor) {
      await sendMessage(
        "Error in making payments, vendor not found",
        phoneNumber
      );
      console.log("Vendor not found");
      return;
    }
    const vendorAccount = await Account.findOne({ ID: vendor._id });
    console.log("2");

    if (!vendorAccount) {
      console.log("Could not find vendor");
      await sendMessage(
        "Error in making payments, could not find vendor",
        phoneNumber
      );
      return;
    }
    const transactionCount = await Transaction.countDocuments({
      ID: vendorAccount._id,
    });

    if (transactionCount >= 100) {
      console.log(`ID  has reached 100 or more transactions.`);
      await sendMessage("Opps, i'm so sorry the tickets are sold out", phoneNumber);
      return;
    }
    const user = await User.findOne({ phoneNumber });
    console.log("3");

    if (!user) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }
    const userAccount = await Account.findOne({ ID: user._id });
    console.log("4");

    if (!userAccount) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);

      return;
    }
    const student = await Student.findOne({ ID: user._id });
    console.log("5");

    if (!student) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }

    const debitAmount = 4000;

    if (userAccount.balance < debitAmount) {
      console.log("6");

      await sendMessage("Opps, Insufficient Funds", phoneNumber);
      return;
    }

    const transaction_ref = generateRandomString(10);
    const oldVendorBalance = vendorAccount.balance;
    const newVendorBalance = Number(oldVendorBalance) + debitAmount;

    const vendorTransaction = new Transaction({
      ID: vendorAccount._id,
      transactionType: "credit",
      accountType: "Vendor",
      amount: 4000,
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
      amount: 4000,
      transaction_ref,
      transaction_fee: 0,
      vendor: vendor.vendorUsername,
      balance: newUserBalance,
      transaction_status: "pending",
      date: Date.now(),
      created_at: Date.now(),
    });
    await vendorTransaction.save();
    await userTransaction.save();

    const link = `https://134b-154-113-158-227.ngrok-free.app/user/api/dinner/confirm/${transaction_ref}`;

    const template = `Confirm the payment of Naira ${debitAmount} for the dinner ${link}`;
    console.log("7");

    await sendMessage(template, user.phoneNumber);
    mixpanel.track("Initiate Transaction", {
      id: transaction_ref,
      "User ID": user._id,
      "Vendor ID": vendor._id,
    });
    mixpanel.track("Payment Pending", {
      amount: "4000",
    });
  } catch (error) {
    console.error(`Initiate error: ${error}`);

    await sendMessage("Something went wrong", phoneNumber);
  }
};
