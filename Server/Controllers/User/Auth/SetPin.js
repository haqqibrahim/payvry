require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Account = require("../../../Models/Account");
const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");
exports.setPin = async (req, res) => {
  try {
    const { pin, token } = req.body;
    if (pin.length < 4) {
      return res.status(500).json({ message: "Pin must be 6 digit" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const saltRounds = 2;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    await Account.updateOne(
      { ID: userId },
      { pin: hashedPin, verificationStatus: true }
    );
    await User.updateOne(
      { _id: userId },
      {
        setPin: true,
      }
    );

      await sendMessage(
        `Welcome ${user.fullName}, embrace the future of finance with payvry.`,
        user.phoneNumber
      );
    
    return res.status(200).json({ message: "Pin set Successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};
