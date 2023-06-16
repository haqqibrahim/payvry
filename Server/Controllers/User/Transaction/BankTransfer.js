require("dotenv").config();
const jwt = require("jsonwebtoken");
const Vendor = require("../../../Models/Vendor");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const Account = require("../../../Models/Account");
const Transaction = require("../../../Models/Transaction");
var Mixpanel = require("mixpanel");
const querystring = require('querystring');
var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");
const { FlwTransfer } = require("../../../Flutterwave/InitiateCharge");

function generateRandomString(length) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

exports.BankTransfer = async (
  amount,
  account_number,
  account_bank,
  phoneNumber
) => {
  try {
    console.log(amount);

    const user = await User.findOne({ phoneNumber });
    console.log("1");

    if (!user) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }
    const userAccount = await Account.findOne({ ID: user._id });
    console.log("2");

    if (!userAccount) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);

      return;
    }
    const student = await Student.findOne({ ID: user._id });
    console.log("3");

    if (!student) {
      await sendMessage("Opps i couldn't find your account", phoneNumber);
      return;
    }

    const debitAmount = Number(amount) + 0;
    console.log("4");

    if (userAccount.balance < debitAmount) {
      await sendMessage("Opps, Insufficient Funds", phoneNumber);
      return;
    }

    const transaction_ref = generateRandomString(10);
    const oldUserBalance = userAccount.balance;
    const newUserBalance = Number(oldUserBalance) - Number(debitAmount);
    console.log("5");
    const amountToTransfer = Number(amount);
    console.log(typeof amountToTransfer);
    console.log(amountToTransfer);

    const accountBank = String(account_bank);
    const accountNumber = String(account_number);

    console.log("6");

    const userTransaction = new Transaction({
      ID: userAccount._id,
      transactionType: "debit",
      accountType: "User",
      amount: Number(amount),
      transaction_ref,
      transaction_fee: 0,
      vendor: "Bank Transfer",
      balance: newUserBalance,
      transaction_status: "pending",
      date: Date.now(),
      created_at: Date.now(),
    });
    await userTransaction.save();
    const queryParams = {
      transaction_ref,
      account_number: accountNumber,
      account_bank: accountBank,
      amount: amountToTransfer,
    };
    // const link = `https://payvry.onrender.com/user/api/p2p/confirm/${transaction_ref}`;
    const url =
      "https://payvry-api.herokuapp.com/user/api/transfer/confirm?" +
      querystring.stringify(queryParams);
    const template = `Confirm the bank transfer ${url}`;
    await sendMessage(template, phoneNumber);
    return;
  } catch (error) {
    console.log(`Bank Transfer server Error: ${error}`);
  }
};
