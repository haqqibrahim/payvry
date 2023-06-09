const { AuthUser } = require("../AI-Auth/AuthUser");
const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");
const { convertNumber } = require("../../../HelperFunctions/ConvertNumber");
const { SaveMemory } = require("../../../HelperFunctions/SaveMemory");
const { PayvryAI } = require("../../AI/PayvryAI");

const Account = require("../../../Models/Account");
const User = require("../../../Models/User");

exports.ReceiveMsg = async (req, res) => {
  try {
    // Destructing the message and sender's number

    let userNumber = req.body["data"]["from"]; // sender number
    const phoneNumber = await convertNumber(userNumber);
    let message = req.body["data"]["body"]; // Message text

    // cHECK IF MSG IS A TEXT:
    let msgType = req.body["data"]["type"];
    if (msgType != "chat") {
      await sendMessage("Oops, Payvry AI only understands text", phoneNumber);
      return res.status(200).send({
        mesage: "Sent",
      });
    }

    // Checking if User Exists
    const foundUser = await AuthUser(phoneNumber);
    if (!foundUser) {
      return res.status(500).send({
        mesage: "Sent",
      });
    }

    console.log("User is found.....");
    console.log("Getting Current Balance.....");
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return console.log("User not found");
    }
    // console.log(user);
    const userAccount = await Account.findOne({ ID: user._id });
    if (!userAccount) {
      return res.status(500).json({ message: "Account not found" });
    }
    console.log(userAccount);
    await SaveMemory(
      phoneNumber,
      "user",
      `This is my **current** balance: ${userAccount.balance}`
    );
    console.log("Adding User Message to Memory.....");
    await SaveMemory(phoneNumber, "user", message);
    const response = await PayvryAI(phoneNumber);
    await sendMessage(response, phoneNumber);
    return;
  } catch (error) {
    console.log(`Receive Message server error: ${error}`);
  }
};
