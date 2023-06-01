require("dotenv").config();

const User = require("../../../Models/User");
const Transaction = require("../../../Models/Transaction");
const Account = require("../../../Models/Account");

const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");

var Mixpanel = require("mixpanel");
var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

exports.confirmDeposit = async (req, res) => {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== secretHash) {
      // This request isn't from Flutterwave; discard
      res.status(401).end();
    }
    const payload = req.body;
    // It's a good idea to log all received events.
    console.log(payload);
    const { email } = req.body.data.customer;
    const { amount,id } = req.body.data;
    const tx_ref = req.body.data.device_fingerprint;
    const ID = String(id)
    console.log(`Req ID: ${id}`)
    console.log(`Formated String ${ID}`)

    console.log(`Tx_REf: ${tx_ref}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(500).json({ message: "User not found" });
    }
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      console.log("Account not found");
      return res.status(500).json({ message: "Account not found" });
    }
    const tx = await Transaction.findOne({ transaction_ref: tx_ref });
    console.log(`Tx Found:${tx}`);
    if (!tx) {
      console.log("Transaction not found");
      return res.status(500).json({ message: "Transaction not found" });
    }
    const receiver = user.phoneNumber;

    const response = await flw.Transaction.verify({ id: ID });
    if (
      response.data.status === "successful" &&
      response.data.amount === tx.amount &&
      response.data.currency === "NGN"
    ) {
      // Success! Confirm the customer's payment
      
      const updatedTx = await Transaction.updateOne(
        { transaction_ref: tx_ref },
        { $set: { status: "completed" } }
      );
      console.log(updatedTx);

      const updatedAccount = await Account.updateOne(
        { _id: userAccount._id },
        {
          $set: {
            lastTransactionAmount: tx.amount,
            lastTransactionType: "deposit",
            balance: tx.balance,
          },
        }
      );
      console.log(updatedAccount);
      console.log(`New Tx: ${tx}`);
      mixpanel.track("Deposit Funds", {
        id: tx_ref,
        type: "User",
        "User ID": user._id,
      });
      mixpanel.track("Deposit", {
        amount,
      });
      sendMessage(
        `Your have successfully funded your payvry account with  Naira ${amount}`,
        receiver
      );
      return res.status(200).json({ message: "Transaction Updated" });
    } else {
      // Inform the customer their payment was unsuccessful
      sendMessage(
        `Your payvry deposit failed, your money will be reversed soon!`,
        receiver
      );
      return res.status(500).json({ message: "Transaction Failed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
