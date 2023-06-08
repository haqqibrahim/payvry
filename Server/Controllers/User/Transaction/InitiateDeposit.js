require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Transaction = require("../../../Models/Transaction");
const Account = require("../../../Models/Account");
const { charge } = require("../../../Flutterwave/InitiateCharge");
const { generateRandomString } = require("../../../HelperFunctions/Reference");

const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");

exports.deposit = async (req, res) => {
  try {
    const { amount, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const email = user.email;
    const name = user.fullName;
    const phone_number = user.phoneNumber;
    const tx_ref = await generateRandomString(25);
    const depositResponse = await charge(amount, email, phone_number, tx_ref);
    const { code, message, transfer_details } = depositResponse;
    console.log(transfer_details);
    if (code === 500) {
      return res.status(code).json({ message });
    }
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      console.log("Account not found");
      return res.status(500).json({ message: "Account not found" });
    }
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) + Number(amount);

    const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "credit",
      accountType: "User",
      amount,
      transaction_ref: tx_ref,
      status: "pending",
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();
    console.log(`Transaction Pending: ${transaction}`);
    return res.status(code).json({ message, transfer_details });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.depositAI = async (amount, phoneNumber) => {
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return "Sorry i couldn't find your account";
    }
    const email = user.email;
    const name = user.fullName;
    const phone_number = user.phoneNumber;
    const tx_ref = await generateRandomString(25);
    const depositResponse = await charge(amount, email, phone_number, tx_ref);
    const { code, message, transfer_account, transfer_bank, transfer_amount } =
      depositResponse;
    if (code === 500) {
      return message;
    }
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      console.log("Account not found");
      return "Oops, i could not find your account!";
    }
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) + Number(amount);

    const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "credit",
      accountType: "User",
      amount,
      transaction_ref: tx_ref,
      status: "pending",
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();
    console.log(`Transaction Pending: ${transaction}`);
    await sendMessage(
      `Transfer Naira ${transfer_amount} to \n\nAccount No: ${transfer_account} \nBank: ${transfer_bank} \nAccount Name: Payvry finance or Payvry FLW`,
      phoneNumber
    );
    await sendMessage(
      "Also, after you have made the transfer wait for 10 minutes for your transfer to be processed!",
      phoneNumber
    );
    return { transfer_account, transfer_bank, transfer_amount };
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
