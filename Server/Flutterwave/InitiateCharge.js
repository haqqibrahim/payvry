require("dotenv").config();

const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const { generateRandomString } = require(".././HelperFunctions/Reference");

exports.charge = async (amount, email,  phone_number, tx_ref) => {
  const details = {
    tx_ref,
    amount,
    email,
    phone_number,
    currency: "NGN",
    device_fingerprint: tx_ref
  };
  const response = await flw.Charge.bank_transfer(details);
  if (response.status != "success") {
    return { code: 500, message: response.message };
  }
  return {
    code: 200,
    message: response.message,
    transfer_details: response.meta.authorization,
  };
};
