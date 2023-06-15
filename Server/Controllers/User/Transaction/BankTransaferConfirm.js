require("dotenv").config();
const bcrypt = require("bcrypt");
const Account = require("../../../Models/Account");
const Transaction = require("../../../Models/Transaction");
var Mixpanel = require("mixpanel");
const Vendor = require("../../../Models/Vendor");
const User = require("../../../Models/User");
const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");
const Student = require("../../../Models/Student");
const { GetBankDetails } = require("../../../Flutterwave/GetBankDetails");
const { FlwTransfer } = require("../../../Flutterwave/InitiateCharge");
const { Reciept } = require("../../../HelperFunctions/Reciept");
const { getCurrentDateTime } = require("../../../HelperFunctions/DateTime");
const fs = require("fs");
const path = require("path");
const {
  sendReciept,
} = require("../../../HelperFunctions/Whatsapp-Send-Receipt");
var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
const jsonData = require("../../../banks.json");

exports.BankTransferConfirmPage = async (req, res) => {
  try {
    const transaction_ref = req.query.transaction_ref;
    const account_number = req.query.account_number;
    const account_bank = req.query.account_bank;
    const amount = parseInt(req.query.amount);
    console.log(account_number);
    console.log(account_bank);
    const completedTransactions = await Transaction.find({
      transaction_ref: transaction_ref,
      status: "completed",
    });

    if (completedTransactions.length > 0) {
      console.log("Status is completed.");
      res.render("TxStatus", {
        message: "This transaction has already been confirmed and completed",
        status: "text-green-300",
      });
      return;
    }

    console.log("Status is not completed.");

    const tx = await Transaction.find({ transaction_ref });
    console.log(tx);

    const userId = tx[0].ID;

    const userAccount = await Account.findOne({ _id: userId });
    if (!userAccount) {
      console.log("User Account not found");
      return;
    }

    const user = await User.findById(userAccount.ID);
    if (!user) {
      console.log("Vendor not found");
      return;
    }

    const { code, message, account_name } = await GetBankDetails(
      account_number,
      account_bank
    );
    if (code == 500) {
      console.log(`Get Details Error: ${message}`);
      res.render("TxStatus", {
        message,
        status: "text-green-300",
      });
      return;
    }

    res.render("BankTransfer", {
      account_number,
      account_bank,
      userID: user._id,
      amount: tx[0].amount,
      transaction_ref,
      account_name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Aolcls
exports.BankTransferConfirmTransaction = async (req, res) => {
  try {
    const {
      transaction_ref,
      pin,
      account_number,
      account_bank,
      account_name,
      amount,
    } = req.body;
    const completedTransactions = await Transaction.find({
      transaction_ref: transaction_ref,
      status: "completed",
    });

    if (completedTransactions.length > 0) {
      console.log("Status is completed.");

      return;
    }

    const tx = await Transaction.find({ transaction_ref });

    const userId = tx[0].ID;

    const userAccount = await Account.findOne({ _id: userId });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    const user = await User.findById(userAccount.ID);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    // Check if password is correct
    const pinMatch = await bcrypt.compare(pin, userAccount.pin);
    if (!pinMatch) {
      return res.render("TxStatus", {
        message: "Invalid password",
        status: "text-red-300",
      });
    }
    const student = await Student.findOne({ ID: user._id });
    if (!student) {
      return res.status(500).json({ message: "Student not found" });
    }
    const amountToCharge = Number(amount);
    const { code, message } = await FlwTransfer(
      amountToCharge,
      account_bank,
      account_number,
      user.email,
      transaction_ref
    );
    if (code == 500) {
      await sendMessage(message, user.phoneNumber);
      return;
    }

    console.log("Updating.......................");

    await Transaction.updateMany(
      { transaction_ref: transaction_ref },
      { status: "completed" }
    );

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance: tx[0].balance,
        lastTransactionType: "debit",
        lastTransactionAmount: tx[0].amount,
      }
    );
    await sendMessage(
      `Your Bank transfer of Naira ${tx[0].amount} to ${account_name} has been Queued Successfully`,
      user.phoneNumber
    );

    const date_time = getCurrentDateTime();
   
    function findBankNameByCode(code) {
      const banks = jsonData.data;    
      for (const bank of banks) {
        if (bank.code === code) {
          return bank.name;
        }
      }
    
      return null; // Return null if no match found
    }
    
    // Example usage
    const bankName = findBankNameByCode(account_bank);
    await Reciept(
      amount,
      account_name,
      account_number,
      bankName,
      date_time,
      transaction_ref,
      user.phoneNumber
    );

    mixpanel.track("Confirm Transaction", {
      id: transaction_ref,
      "User ID": userId,
    });
    mixpanel.track("Payment Processed", {
      amount: tx[0].amount,
    });
    return res.render("TxStatus", {
      message: "Transactions Competed.",
      status: "text-green-300",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
