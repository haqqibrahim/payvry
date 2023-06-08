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

var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

exports.P2PConfirmPage = async (req, res) => {
  try {
    const transaction_ref = req.params.id;
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

    const recieverId = tx[0].ID;

    const receiverAccount = await Account.findById({ _id: recieverId });
    if (!receiverAccount) {
      console.log("Receiver Account not found");
      return;
    }

    const receiver = await User.findById(receiverAccount.ID);
    if (!receiver) {
      console.log("Reciever not found");
      return;
    }

    const userId = tx[1].ID;

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

    res.render("p2pPin", {
      vendor: receiver.fullName,
      userID: user._id,
      amount: tx[0].amount,
      transaction_ref,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Aolcls
exports.P2PconfirmTransaction = async (req, res) => {
  try {
    const { transaction_ref, pin } = req.body;
    const tx = await Transaction.find({ transaction_ref });
    const receiverId = tx[0].ID;

    const receiverAccount = await Account.findById({ _id: receiverId });

    if (!receiverAccount) {
      return res.status(500).json({ message: "Receiver  Account not found" });
    }
    const receiver = await User.findById(receiverAccount.ID);
    if (!receiver) {
      return res.status(500).json({ message: "Vendor not found" });
    }
    const userId = tx[1].ID;

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
    console.log("Updating.......................");

    await Transaction.updateMany(
      { transaction_ref: transaction_ref },
      { status: "completed" }
    );

    await Account.updateOne(
      { _id: receiverAccount._id },
      {
        balance: tx[0].balance,
        lastTransactionType: "credit",
        lastTransactionAmount: tx[0].amount,
      }
    );

    await Account.updateOne(
      { _id: userAccount._id },
      {
        balance: tx[1].balance,
        lastTransactionType: "debit",
        lastTransactionAmount: tx[1].amount,
      }
    );
    await sendMessage(
      `Your payment of Naira ${tx[1].amount} to ${receiver.fullName} is successful`,
      user.phoneNumber
    );
    await sendMessage(
      `${user.fullName} just sent you ${tx[0].amount}`,
      receiver.phoneNumber
    );
    mixpanel.track("Confirm Transaction", {
      id: transaction_ref,
      vendor: receiverId,
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
