require("dotenv").config();
const bcrypt = require("bcrypt")
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

exports.confirmTransactionPage = async (req, res) => {
  try {
    const transaction_ref = req.params.id;
    const completedTransactions = await Transaction.find({
      transaction_ref: transaction_ref,
      status: "completed",
    });

    if (completedTransactions.length > 0) {
      console.log("Status is completed.");
      return;
    }

    console.log("Status is not completed.");

    const tx = await Transaction.find({ transaction_ref });

    const vendorId = tx[0].ID;

    const vendorAccount = await Account.findById({ _id: vendorId });
    if (!vendorAccount) {
      console.log("vendor Account not found");
      return;
    }

    const vendor = await Vendor.findById(vendorAccount.ID);
    if (!vendor) {
      console.log("Vendor not found");
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

    res.render("Pin", {
      vendor: vendor.vendorUsername,
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
exports.confirmTransaction = async (req, res) => {
  try {
    const { transaction_ref, pin } = req.body;
    const tx = await Transaction.find({ transaction_ref });
    const vendorId = tx[0].ID;

    const vendorAccount = await Account.findById({ _id: vendorId });

    if (!vendorAccount) {
      return res.status(500).json({ message: "Vendor Account not found" });
    }
    const vendor = await Vendor.findById(vendorAccount.ID);
    if (!vendor) {
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
      return res.status(500).json({ message: "Invalid password" });
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
      { _id: vendorAccount._id },
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
      `Your payment of Naira ${tx[1].amount} to ${vendor.vendorUsername} is successful`,
      user.phoneNumber
    );
    await sendMessage(
      `${user.fullName} with the matric no: ${student.matricNumber}, made a payment of ${tx[0].amount}`,
      vendor.phoneNumber
    );
    mixpanel.track("Confirm Transaction", {
      id: transaction_ref,
      vendor: vendorId,
      "User ID": userId,
    });
    mixpanel.track("Payment Processed", {
      amount: tx[0].amount,
    });
    res.status(200).json({ message: "Transactions Competed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
