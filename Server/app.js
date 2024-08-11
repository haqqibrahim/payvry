require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const UserAuthRoutes = require("./Routes/User/UserAuthRoutes");
const vendorAuthRoutes = require("./Routes/Vendor/VendorAuthRoutes");
const userTransactionRoutes = require("./Routes/User/UserTransactionRoutes");
const vendorTransactionRoutes = require("./Routes/Vendor/VendorTransactionRoutes");
const AnalicsRoute = require("./Routes/Analytics/Dashboard");
const UserAIRoutes = require("./Routes/User/UserAIRoutes");
const app = express();
const whatsAppClient = require("@green-api/whatsapp-api-client");
const { ReceiveMsgGreen } = require("./Controllers/User/AI-Message/ReceiveMsg");
const Flutterwave = require("flutterwave-node-v3");
const {GetBankDetails} = require("./Flutterwave/GetBankDetails")

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Set up MongoDB connection
if (port != 5000) {
  const DB_URI = process.env.DB_URI;
  mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected in producion"))
    .catch((err) => console.log(err));
} else {
  const DB_URI = process.env.DB_URI_DEVELOPMENT;
  mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected in development"))
    .catch((err) => console.log(err));
}

// Use the authentication routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Payvry" });
});
app.get("/banks", (req, res) => {
  const getBanks = async () => {
    try {
      const payload = {
        country: "NG", //Pass either NG, GH, KE, UG, ZA or TZ to get list of banks in Nigeria, Ghana, Kenya, Uganda, South Africa or Tanzania respectively
      };
      const response = await flw.Bank.country(payload);
      console.log(response);
      res.status(200).json({message: response})
    } catch (error) {
      console.log(error);
      res.status(500).json({message: error})

    }
  };
  getBanks();
});
app.post("/transfer", (req, res) => {
  const initTrans = async (bank, account_number, amount,reference) => {

    try {
        const payload = {
        "account_bank": bank,
        "account_number": account_number,
        "amount": amount,
        "narration": "Chrsipay Bank Transfer",
        "currency": "NGN",
        "reference": reference, //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
        "callback_url": "https://www.flutterwave.com/ng/",
        "debit_currency": "NGN"
    }

        const response = await flw.Transfer.initiate(payload)
        console.log(response);
        res.status(200).json({message: response})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }

}


const {bank, account_number, amount, reference} = req.body
// const bank = "033"
// const account_number = "2124955312"
// const amount = 150
// const reference = kddjd
initTrans(bank, account_number, amount, reference);
})

app.post("/verify_bank", async (req, res) => {
  const {account_number, account_bank} = req.body
  // const account_number = "2148029455"
  // const account_bank = "033"
  const {code, message, account_name} = await GetBankDetails(account_number, account_bank)
  res.status(200).json({message: account_name})
})

app.use("/analytics", AnalicsRoute);
app.use("/user/api", UserAuthRoutes);
app.use("/user/api", userTransactionRoutes);
app.use("/vendor/api", vendorAuthRoutes);
app.use("/vendor/api", vendorTransactionRoutes);
// app.use("/ultramsgwebhook", UserAIRoutes);
const webHookAPI = whatsAppClient.webhookAPI(app, "/ultramsgwebhook");

webHookAPI.onIncomingMessageText(
  (data, idInstance, idMessage, sender, typeMessage, textMessage) => {
    console.log(`outgoingMessageStatus data ${data.toString()}`);
    console.log(`Incoming Notification Sender ${JSON.stringify(sender)}`);
    console.log(`Incoming Notification Message ${JSON.stringify(textMessage)}`);
    ReceiveMsgGreen(sender, textMessage);
  }
);

// start the server
app.listen(port, "0.0.0.0", async () => {
  console.log(`Server running on port ${port}`);
});
