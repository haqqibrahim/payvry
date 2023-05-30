require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../Models/User");
const Transaction = require("../../Models/Transaction");
const Account = require("../../Models/Account");
const { compareNames } = require("../../HelperFunctions/Name");
var Mixpanel = require("mixpanel");

var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

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
    const { amount, transaction_ref, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) + Number(amount);

    const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "credit",
      accountType: "User",
      amount,
      transaction_ref,
      status: "completed",
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance,
        lastTransactionType: "deposit",
        lastTransactionAmount: amount,
      }
    );
    mixpanel.track("Deposit Funds", {
      "id": transaction_ref,
      "type": "User",
      "User ID": userId,
    });
    mixpanel.track("Deposit", {
      amount
    })
    return res.status(200).json({ message: "Transaction Saved", transaction });
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
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }

    if (userAccount.balance < amount) {
      return res.status(500).json({ message: "Insufficient Funds" });
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
    const oldBalance = userAccount.balance;
    const balance = Number(oldBalance) - Number(amount);

    const transaction = new Transaction({
      ID: userAccount._id,
      transactionType: "withdraw",
      accountType: "User",
      amount,
      transaction_ref: reference,
      transaction_fee: 0,
      status: "completed",
      balance,
      date: Date.now(),
      created_at: Date.now(),
    });
    await transaction.save();

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance,
        lastTransactionType: "withdraw",
        lastTransactionAmount: amount,
      }
    );
    mixpanel.track("Withdraw Funds", {
      "id": reference,
      "Type": "User",
      "User ID": userId
    })
    mixpanel.track("Withdraw", {
      amount
    })
    return res
      .status(200)
      .json({ message: "Transaction Successful", transaction });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

exports.balance = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
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

exports.history = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: userId });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const userTx = await Transaction.find({ ID: userAccount._id });
    return res.status(200).json({ message: userTx });
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
