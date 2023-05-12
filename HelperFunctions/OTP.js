const OTP = require("../Models/OTP");
const User = require("../Models/User");
const Vendor = require("../Models/Vendor");
const { sendMessage } = require("./Whatsapp-Send-Message");

exports.sendOTP = async (recieverID, reciever) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  const otp = new OTP({
    ID: recieverID,
    code,
    created_at: Date.now()
  });

  //Saving OTP to DB
  console.log("Saving OTP to DB");
  await otp.save();

  // Sending OTP
  console.log("Sending OTP");
  sendMessage(
    `Your Payvry verification code is: ${code}. NOTE CODE EXPIRES IN 5 MINUTES`,
    reciever
  );
};

exports.verifyOTP = async (recieverID, code, type) => {
  const otpReference = await OTP.findOne({ ID: recieverID });
  if (!otpReference) {
    return { code: 500, message: "OTP not found" };
  }
  console.log(otpReference);
  const FIVE_MINUTES_IN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
  const currentTime = new Date(); // Get the current time
  const createdAtTime = otpReference.created_at.getTime();
  console.log(createdAtTime);
  const differenceInMs = currentTime.getTime() - createdAtTime;
    console.log(differenceInMs);

  if (differenceInMs > FIVE_MINUTES_IN_MS) {
    await OTP.deleteOne({ ID: recieverID });
    console.log("OTP has expired, request for anothe OTP");
    return { code: 500, message: "OTP has expired, request for anothe OTP" };
  }

  if (code !== otpReference.code) {
    return { code: 500, message: "OTP is not correct" };
  }

  await OTP.deleteOne({ ID: recieverID });
  if (type === "User") {
    await User.findOneAndUpdate(
      { _id: recieverID },
      {
        verificationStatus: true,
      }
    );
  } else {
    await Vendor.updateOne(
      { _id: recieverID },
      {
        verificationStatus: true,
      }
    );
  }

  return { code: 200, message: "Verification Complete" };
};
