const OTP = require("../Models/OTP");
const User = require("../Models/User");
const Vendor = require("../Models/Vendor");
const { sendMessage } = require("./Whatsapp-Send-Message");

exports.sendOTP = async (reciever) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000);
    const otp = new OTP({
      ID: reciever,
      code,
      created_at: Date.now(),
    });

    //Saving OTP to DB
    console.log("Saving OTP to DB");
    await otp.save();
    
    // Sending OTP
    console.log(`Sending OTP: ${otp}`);
    sendMessage(
      `Your Payvry verification code is: ${Number(code)}. NOTE CODE EXPIRES IN 15 MINUTES`,
      reciever
    );
  } catch (error) {
    console.log(error.message);
  }
};

exports.verifyOTP = async (reciever, code) => {
  const otpRef = await OTP.find({ ID: reciever });
  if (!otpRef) {
    return { code: 500, message: "OTP not found" };
  }

  const otpReference = otpRef[otpRef.length - 1]
  console.log(otpReference);
  const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
  const currentTime = new Date(); // Get the current time
  const createdAtTime = otpReference.created_at.getTime();
  const differenceInMs = currentTime.getTime() - createdAtTime;

  if (differenceInMs > FIFTEEN_MINUTES_IN_MS) {
    await OTP.deleteMany({ ID: reciever });
    console.log("OTP has expired, request for anothe OTP");
    return { code: 500, message: "OTP has expired, request for anothe OTP" };
  }

  console.log(otpReference.code);

  if (code !== otpReference.code) {
    await OTP.deleteMany({ ID: reciever });
    
    return { code: 500, message: "OTP is not correct, request for another OTP" };
  }

  await OTP.deleteOne({ ID: reciever });

  return { code: 200, message: "Phone number verified" };
};
