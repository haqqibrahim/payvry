require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const nodeHtmlToImage = require("node-html-to-image");
const path = require("path");
const { convertAmountToWords } = require("./convertThreeDigitNumber");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { sendReciept } = require("./Whatsapp-Send-Receipt");
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Example usage

exports.Reciept = async (
  amount,
  account_name,
  account_number,
  account_bank,
  date_time,
  transaction_ref,
  phoneNumber
) => {
  const amount_in_words = convertAmountToWords(Number(amount));
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Receipt</title>
        <link rel="stylesheet" href="styles.css">
    </head>
  <style>
  * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.receipt {
  position: relative;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  max-width: 430px;
  padding-bottom: 10px;
  margin: 9vh auto;
  font-family: Arial, sans-serif;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
}

.receipt-header {
  position: absolute;
  top: 0;
  left: 0;
  text-align: center;
  background-color: #F5F5F5;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  width: 100%;
}

p.top {
  font-size: 14px;
  justify-content: center;
  color: #333;
}

p.fields {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  line-height: 26px;
  padding: 2px;
  border-bottom: 1px solid #eee;
}

#different{
  border-bottom: none;
}

span {
  display: flex;
  text-align: right;
}

h1.transaction-amount {
  font-size: 32px;
  font-weight: bold;
  margin: 5px 0;
  color: #05DBC1;
}

#transaction-date {
  color: red;
}

.receipt-details {
  display: flex;
  flex-direction: column;
  margin-top: 120px;
}

.receipt-details p {
  width: 390px;
  margin-bottom: 10px;
  font-size: 14px;
}

.receipt-details {
  display: inline-block;
  color: #555;
  width: auto;
  flex-grow: 1;
  text-align: left;
}

.receipt-details span {
  font-weight: bold;
  color: #333;
  text-align: right;
}
  </style>
    <body>
        <div class="receipt">
            <div class="receipt-header">
                <p class="top">You just transferred</p>
                <h1 class="transaction-amount">NGN 100.00</h1>
                <p class="top">to Blossom Kitchen</p>
            </div>
            <div class="receipt-details">
                <p class="fields">Date & Time:<span id="transaction-date">${date_time}</span></p>
                <p class="fields">Reference Number:<span id="reference-number">${transaction_ref}</span></p>
                <p class="fields">Transaction Amount:<span class="transaction-amount">NGN ${amount}</span></p>
                <p class="fields">Amount in Words:<span id="amount-in-words">${amount_in_words} Naira</span></p>
                <p class="fields">Transaction Type:<span id="transaction-type">Debit</span></p>
                <p class="fields">Receiver:<span id="receiver">${account_name}</span></p>
                <p class="fields">Account Number:<span id="account-number">${account_number}</span></p>
                <p class="fields">Receiving Bank:<span id="receiving-bank">${account_bank}</span></p>
                <p class="fields" id="different">Narration:<span id="narration">Payvry Bank Transfer</span></p>
            </div>
        </div>
    </body>
    </html>
    `;
  
  
  try {
    // Generate image from HTML using node-html-to-image
    const image = await nodeHtmlToImage({
      output: "./image.png",
      html,
    });

    console.log("The image was created successfully!");

    const fileBuffer = fs.readFileSync("./image.png");


    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: `receipt-${transaction_ref}.png`,
      ContentType: "image/png",
    };

    // Send the upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    const getObjectParams = {
      Bucket: bucketName,
      Key: `receipt-${transaction_ref}.png`,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3Client, command, { expires: 43200 });
    await sendReciept(url, phoneNumber);

    // Delete the local file after use
    fs.unlinkSync("./image.png");

    console.log("Image uploaded to S3 successfully:", url);
  } catch (error) {
    console.error("Error generating or uploading the image:", error);
  }
};
