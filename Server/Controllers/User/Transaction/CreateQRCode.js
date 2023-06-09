require("dotenv").config();
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const Student = require("../../../Models/Student");
const fs = require("fs");
const nodemailer = require("nodemailer");
const {
  sendMessage,
} = require("../../../HelperFunctions/Whatsapp-Send-Message");

// Nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "payvry@gmail.com",
    pass: "ypypetlooxdnkypx",
  },
});
// API endpoint to generate a QR code and store user data
exports.createQRcode = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decoding the token
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    const fullName = user.fullName;

    const student = await Student.findOne({ ID: user._id });
    if (!student) {
      return res.status(500).json({ message: "Student not found" });
    }
    const matricNumber = student.matricNumber;

    const data = `${fullName}, ${matricNumber}`;
    // Generate the QR code
    const qrCode = await QRCode.toDataURL(data);
    // Save the QR code as an image file
    const qrCodeBuffer = Buffer.from(qrCode.split(",")[1], "base64");
    fs.writeFileSync("qrcode.png", qrCodeBuffer);
    res.status(200).json({ qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.QrCodeGen = async (email, fullName, phoneNumber, matricNumber) => {
  try {
    const data = `${fullName} with the Matric NO: ${matricNumber} Dinner & Award Night Ticket is approved`;
    // Generate the QR code
    const qrCode = await QRCode.toDataURL(data);
    // Save the QR code as an image file
    const qrCodeBuffer = Buffer.from(qrCode.split(",")[1], "base64");
    fs.writeFileSync(`${matricNumber}.png`, qrCodeBuffer);
    const ticket = fs.readFileSync(`${matricNumber}.png`);
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dinner & Award Night Ticket</title>
      <style>
        /* CSS styles */
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Dinner & Award Night Ticket</h1>
        <p>Heyyy ${fullName}, here's your Dinner & Award Night ticket!</p>
      </div>
    </body>
    </html>
  `;

    let mailOptions = {
      from: "payvry@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Dinner & Award Night Ticket", // Subject line
      html: htmlContent,
      attachments: [
        {
          filename: `${fullName} Dinner & Award Night Ticket.png`,
          content: ticket,
        },
      ],
    };

    // Send the email
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.error(err);
        console.log("Failed to send the statement.");
      }
      console.log("Email sent:", info.response);
      await sendMessage(
        `Your Dinner ticket has been sent to this email: ${email}`,
        phoneNumber
      );
      return;
    });
  } catch (error) {
    console.log(error);
  }
};
