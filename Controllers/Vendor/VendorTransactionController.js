require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Vendor = require("../../Models/Vendor");
const User = require("../../Models/User");
const Account = require("../../Models/Account");
const Transaction = require("../../Models/Transaction");
const { compareNames } = require("../../HelperFunctions/Name");

const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

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
    "Date-time",
    "Transtaction-ref",
    "balance",
    "Amount",
    "Account",
    "Transaction fee",
    "Transaction Type",
    "ID",
  ];
  const rows = transactions.map(
    ({
      date,
      transtaction_ref,
      balance,
      amount,
      accountType,
      transaction_fee,
      transactionType,
      ID,
    }) => [
      date,
      transtaction_ref,
      balance,
      amount,
      transaction_fee,
      accountType,
      transactionType,
      ID,
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
    const { token } = req.body; // getting the token from the cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }
    const userAccount = await Account.findOne({ ID: vendorId });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const balance = userAccount.balance;
    return res.status(200).json({ message: balance });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const { matricNumber, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    console.log("Vendor found");
    const student = await User.find({ matricNumber });
    if (student.length == []) {
      return res.status(500).json({ message: "Matric Number not found" });
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
      return res.status(500).json({ message: "Vendor not found" });
    }
    const user = await User.findOne({ matricNumber });
    if (!user) {
      return res.status(500).json({ message: "Matric Number not found" });
    }

    console.log(user);

    const userAccount = await Account.findOne({ ID: user._id });
    // Check if password is correct
    const pinMatch = await bcrypt.compare(pin, userAccount.pin);
    if (!pinMatch) {
      return res.status(500).json({ message: "Invalid pin" });
    }
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const debitAmount = Number(amount) + 10;

    if (userAccount.balance < debitAmount) {
      return res.status(500).json({ message: "Insufficient Funds" });
    }
    const vendorAccount = await Account.findOne({ ID: vendor._id });

    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor Account not found" });
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
      user: user.matricNumber,
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
      date: Date.now(),
      created_at: Date.now(),
    });
    await vendorTransaction.save();
    await userTransaction.save();
    await Account.updateOne(
      { _id: vendorAccount._id },
      {
        balance: newVendorBalance,
        lastTransactionType: "credit",
        lastTransactionAmount: amount,
      }
    );

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance: newUserBalance,
        lastTransactionType: "debit",
        lastTransactionAmount: amount,
      }
    );

    return res.status(200).json({
      message: "Transaction Completed",
      vendorTransaction,
      userTransaction,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.refund = async (req, res) => {
  try {
    const { matricNumber, amount, transaction_ref, token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    const user = await User.findOne({ matricNumber });
    if (!user) {
      return res.status(500).json({ message: "Matric Number not found" });
    }

    console.log(user);

    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }

    const vendorAccount = await Account.findOne({ ID: vendor._id });

    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor Account not found" });
    }

    const tx = await Transaction.findOne({ transaction_ref });
    if (!tx) {
      return res.status(500).json({ message: "Transaction not found" });
    }

    if (vendorAccount.balance < amount) {
      return res.status(500).json({ message: "Insufficient Funds" });
    }

    const oldVendorBalance = vendorAccount.balance;
    const debitAmount = Number(amount) + 10;
    const newVendorBalance = Number(oldVendorBalance) - Number(debitAmount);

    const vendorTransaction = new Transaction({
      ID: vendorAccount._id,
      transactionType: "refund",
      accountType: "Vendor",
      amount,
      transaction_ref: `refund-${transaction_ref}`,
      transaction_fee: 10,
      user: user.matricNumber,
      balance: newVendorBalance,
      date: Date.now(),
      created_at: Date.now(),
    });
    const oldUserBalance = userAccount.balance;
    const newUserBalance = Number(oldUserBalance) + Number(amount);

    const userTransaction = new Transaction({
      ID: userAccount._id,
      transactionType: "refund",
      accountType: "User",
      amount,
      transaction_ref: `refund-${transaction_ref}`,
      transaction_fee: 0,
      vendor: vendor.userName,
      balance: newUserBalance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await vendorTransaction.save();
    await userTransaction.save();
    await Account.updateOne(
      { _id: vendorAccount._id },
      {
        balance: newVendorBalance,
        lastTransactionType: "refund",
        lastTransactionAmount: amount,
      }
    );

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance: newUserBalance,
        lastTransactionType: "refund",
        lastTransactionAmount: amount,
      }
    );

    return res.status(200).json({
      message: "Refund Completed",
      vendorTransaction,
      userTransaction,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.history = async (req, res) => {
  try {
    const { email, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found" });
    }
    const vendorAccount = await Account.findOne({ ID: vendor._id });

    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor Account not found" });
    }
    console.log(vendorAccount);
    const transactions = await Transaction.find({ ID: vendorAccount._id });
    console.log(transactions);
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

exports.withdraw = async (req, res) => {
  try {
    const { account_bank, account_number, account_name, amount, token } =
      req.body;
    const details = {
      account_number,
      account_bank,
    };
    await flw.Misc.verify_Account(details).then((response) => {
      console.log(response);
      if (response.status === "error") {
        res.status(500).json({ message: response.message });
      }

      const account_nameFound = response.data.account_name;

      // Example usage:

      if (
        compareNames(
          account_name.toLowerCase(),
          account_nameFound.toLowerCase()
        )
      ) {
        console.log("The names are the same");
      } else {
        res
          .status(500)
          .json({ message: `Account Name not correct: ${account_nameFound}` });
      }
    });
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const vendorId = decoded.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "Vendor not found" });
    }

    const vendorAccount = await Account.findOne({ ID: vendor._id });

    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor Account not found" });
    }

    if (vendorAccount.balance < amount) {
      return res.status(500).json({ message: "Insufficient Funds" });
    }

    if (amount < 2500) {
      return res
        .status(500)
        .json({ message: "The minimum you can withdraw is 2500" });
    }

    if (account_bank.length > 3) {
      return res.status(500).json({ message: "Bank not supported" });
    }

    const reference = generateRandomString(10);

    const detailsB = {
      account_bank,
      account_number,
      amount,
      narration: "Payvry Withdrawal",
      currency: "NGN",
      reference,
      callback_url: "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
      debit_currency: "NGN",
    };
    const response = await flw.Transfer.initiate(detailsB);
    if (response.status === "error") {
      res.status(500).json({ message: response.message });
    }
    console.log(response);

    const oldVendorBalance = vendorAccount.balance;
    const newVendorBalance = Number(oldVendorBalance) - Number(amount);

    const vendorTransaction = new Transaction({
      ID: vendorAccount._id,
      transactionType: "withdraw",
      accountType: "Vendor",
      amount,
      transaction_ref: reference,
      transaction_fee: 300,
      balance: newVendorBalance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await vendorTransaction.save();
    await Account.updateOne(
      { _id: vendorAccount._id },
      {
        balance: newVendorBalance,
        lastTransactionType: "withdraw",
        lastTransactionAmount: amount,
      }
    );
    return res.status(200).json({ message: "Withdraw Succesful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.verifyBank = async (req, res) => {
  try {
    const details = {
      account_number: req.body.account_number,
      account_bank: req.body.account_bank,
    };
    await flw.Misc.verify_Account(details).then((response) => {
      console.log(response);
      if (response.status === "error") {
        res.status(500).json({ message: response.message });
      }

      const account_name = response.data.account_name;

      res.status(200).json({ message: account_name });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
