require("dotenv").config();
const fs = require("fs");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

exports.GetBankDetails = async (account_number, account_bank) => {
  try {
    console.log(account_number)
    console.log(account_bank)

    const details = {
      account_number,
      account_bank,
    };
    console.log(details)

    const response = await flw.Misc.verify_Account(details)
    console.log(response);
    if (response.status != "success") {
      return { code: 500, message: "Invalid Account Details, please confirm the acount details on WhatsApp"};
    }
    const { account_name } = response.data;
    return {
      code: 200,
      message: response.message,
      account_name
    };
  } catch (err) {
    console.log(`Get Bank details error: ${err}`);
  }
};
