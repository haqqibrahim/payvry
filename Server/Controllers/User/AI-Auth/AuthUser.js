require("dotenv").config();

const User = require("../../../Models/User");

const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");

exports.AuthUser = async (phoneNumber) => {
  console.log("Authenicating User............");
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      await sendMessage(
        `
        As an AI chatbot designed to interact with Payvry users, \nI can assist you with various tasks related to your Payvry account.\nSome examples of the tasks I can help you with are: \n\n1. Deposit money into your Payvry account.\n\n2. Make payments from your Payvry account to a vendor.\n\n3. Make a Bank Transfer from your Payvry account to a supported bank. \n\n4. Check your Payvry account balance \n\n5. Withdraw money from your payvry account.
        `,
        phoneNumber
      );
    
      return false;
    }
    return true;
  } catch (err) {
    console.log(`Auth User Error: ${err}`);
  }
};
