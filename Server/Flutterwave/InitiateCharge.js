require("dotenv").config();
const fs = require('fs');
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const { generateRandomString } = require(".././HelperFunctions/Reference");

exports.charge = async (amount, email, phone_number, tx_ref) => {
  const details = {
    tx_ref,
    amount,
    email,
    phone_number,
    currency: "NGN",
    device_fingerprint: tx_ref,
  };
  const response = await flw.Charge.bank_transfer(details);
  if (response.status != "success") {
    return { code: 500, message: response.message };
  }
  const { transfer_account, transfer_bank, transfer_amount } =
    response.meta.authorization;
  return {
    code: 200,
    message: response.message,
    transfer_account,
    transfer_bank,
    transfer_amount,
  };
};

exports.FlwTransfer = async (
  amount,
  account_bank,
  account_number,
  email,
  
  tx_ref
) => {
  try {
    console.log(amount)
    console.log(typeof amount)
    
    const details = {
      account_bank,
      account_number,
      amount: Number(amount),
      narration: "Payvry Bank Transfer",
      currency: "NGN",
      reference: tx_ref,
      debit_currency: "NGN",
    };
    const response = await flw.Transfer.initiate(details);
    console.log(response);
    if (response.status != "success") {
      return { code: 500, message: response.message };
    }
    // const { transfer_account, transfer_bank, transfer_amount } = response.data;
    return {
      code: 200,
      message: response.message,
    };
  } catch (error) {
    console.log(`Bank Transfer Error from flutterwave: ${error}`);
    console.log(`Bank Transfer Error from flutterwave: ${error.message}`);
    const errorData = {
      message: error.message,
      stack: error.stack,
      // Include any other relevant error information you want to save
    };
  
    const errorJson = JSON.stringify(errorData, null, 2);
    fs.writeFileSync('error.json', errorJson);
  

  }
};
