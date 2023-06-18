// Import Deps
const OpenAI = require("openai");
const { Configuration, OpenAIApi } = OpenAI;

// Import Memory Model
const Memory = require("../../Models/Memory");

// Import Helper Functions
const { sendMessage } = require("../../HelperFunctions/Whatsapp-Send-Message");
const { SaveMemory } = require("../../HelperFunctions/SaveMemory");
const { depositAI } = require("../User/Transaction/InitiateDeposit");
const { initiateTxAI } = require("../Vendor/Transaction/InitiateTx");
const { P2PInit } = require("../User/Transaction/P2PInit");
const jsonData = require("../../banks.json");
const { BankTransfer } = require("../User/Transaction/BankTransfer");

// OpenAI configuration
const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
exports.PayvryAI = async (phoneNumber) => {
  while (true) {
    try {
      // Your existing code here

      console.log("Getting user's memory");
      const memory = await Memory.findOne({ phoneNumber: phoneNumber });
      if (!memory) {
        return console.log("Memory not found");
      }
      const memoryMsg = memory["messages"];
      const last10Entries = memoryMsg.slice(-10);

      const rolesAndContent = last10Entries.map(({ role, content }) => ({
        role,
        content,
      }));

      banks = {
        role: "System",
        content: `This is a list of banks payvry supports:
        1 UBA
        2. First Bank
        3. Access Bank
        4. Zentih Bank
        5  GTBank
        6. Sterling Bank
        7. Kuda
        8 Opay
        9 FCMB
        , use this to find the bank name for the user's that want to make a bank transfer. Ensure at all times never ever send a response of the list of banks and               Ensure at all times you do not show the list of banks to the user, just take the bank the user provides and find the bank.
        `,
      };
      // msg.push(banks);
      msg.push(...rolesAndContent);
      //  Calling the OpenAI API
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        messages: msg,
      });

      const response = completion.data.choices[0].message.content;
      console.log(response);
      console.log(completion.data);

      async function checkSentence(sentence, phoneNumber) {
        const keywords = [
          "Payment-Payvry",
          "Deposit-Payvry",
          "Withdraw-Payvry",
          "Payment-User-Payvry",
          "Transfer-User-Payvry",
        ];
        const amountRegex = /\d+(\.\d+)?/; // Regular expression to match an amount
        const recipients = [
          "blossom",
          "Blossom",
          // "adonai",
          // "top fruit",
          // "tuk shop",
          "daily buds",
          "Daily buds",
          "daily Buds",
          "Daily Buds",
        ];

        const sentenceLowerCase = sentence.toLowerCase(); // Convert sentence to lowercase for case-insensitive matching

        const keywordFound = keywords.find((keyword) =>
          sentenceLowerCase.includes(keyword.toLowerCase())
        );

        if (keywordFound) {
          switch (keywordFound) {
            case "Payment-Payvry":
              const recipient = recipients.find((r) => sentence.includes(r));
              if (recipient) {
                console.log(`Recipient found: ${recipient}`);
                const match = sentence.match(amountRegex);
                if (match) {
                  const amount = match[0];
                  console.log(`Amount found: ${amount}`);
                  await initiateTxAI(recipient, phoneNumber, Number(amount));
                } else {
                  console.log("Amount not found");
                }
              } else {
                console.log("Vendor not found");
              }
              break;

            case "Payment-User-Payvry":
              const matchPhoneNumber = sentence.match(/\d{11}/); // Regular expression to match an 11-digit phone number
              if (matchPhoneNumber) {
                const recipientNumber = matchPhoneNumber[0];
                const matchAmount = sentence.match(amountRegex);
                if (matchAmount) {
                  const amount = matchAmount[0];
                  console.log(`Recipient number found: ${recipientNumber}`);
                  console.log(`Amount found: ${amount}`);
                  console.log("Calling function");
                  await P2PInit(recipientNumber, phoneNumber, Number(amount));
                } else {
                  console.log("Amount not found");
                }
              } else {
                console.log("Recipient number not found");
              }
              break;

            case "Transfer-User-Payvry":
              const accountNumberMatch = sentence.match(/\d{10}/); // Regular expression to match a 10-digit account number
              if (accountNumberMatch) {
                const account_number = accountNumberMatch[0];
                const match = sentence.match(/amount:\s?([0-9,]+)/i);
                const amount =
                  match && match[1] ? match[1].replace(/,/g, "") : null;
                console.log(`Amount: ${amount}`);
                console.log(`Account Number: ${account_number}`);

                const banks = [
                  "UBA",
                  "First Bank",
                  "Access Bank",
                  "Zenith Bank",
                  "GTBank",
                  "Sterling Bank",
                  "Kuda",
                  "Opay",
                  "FCMB",
                ];
                const matchedBank = banks.find((bank) =>
                  sentence.includes(bank)
                );
                if (matchedBank) {
                  console.log(`Bank found: ${matchedBank}`);
                  const bank = jsonData["data"].find(
                    (bank) => bank.name === matchedBank
                  );
                  console.log(bank);
                  const account_bank = bank ? bank.code : null;
                  console.log(account_bank);
                  await BankTransfer(
                    amount,
                    account_number,
                    account_bank,
                    phoneNumber
                  );
                } else {
                  console.log("Bank not found");
                }
              } else {
                console.log("Recipient number not found");
              }
              break;

            case "Deposit-Payvry":
              const match = sentence.match(amountRegex);
              if (match) {
                const amount = match[0];
                console.log(`Amount found: ${amount}`);
                await depositAI(amount, phoneNumber);
              }
              break;

            case "Withdraw-Payvry":
              const link = "https://payvry.vercel.app/user/withdraw";
              const msg = `You can make a withdrawal through this link: ${link}`;
              await sendMessage("To make a withdrawal, just make a bank transfer to the bank acount of your choice.", phoneNumber);
              break;

            default:
              break;
          }
        } else {
          console.log(`The sentence: ${sentence}`);
          await sendMessage(sentence, phoneNumber);
        }
      }

      await checkSentence(response, phoneNumber);

      // Save AI's Message/Response to MemoryDB
      await SaveMemory(
        phoneNumber,
        "assistant",
        completion.data.choices[0].message.content
      );

      break; // Exit the loop if the code runs without any error
    } catch (error) {
      console.log(`Open AI Error ${error}`);
      console.log(`Open AI Error message ${error.message}`);
      await sendMessage("Please resend your last message", phoneNumber)

      // Handle the error, such as logging it or taking appropriate actions
      // You can also add a delay before retrying the code if desired
      // Add a delay of 2 second (2000 milliseconds) before retrying the code
      await new Promise((resolve) => setTimeout(resolve, 20000));
      return;
    }
  }
};

let msg = [
  {
    role: "system",
    content: `
            You are Payvry AI, a Large Language Model developed by Payvry Finance, co-founded by Ibrahim Abdulhaqq and Bakare Oluwakorede. You are designed to be a conversational chatbot that allows users to interact with their Payvry Naira accounts based on the user's input. Your purpose is to answer the user's inquiries and fulfill their requests. You must not engage in arguments or debates and should strictly adhere to the user's instructions.
            There are three specific tasks based on the ongoing conversation with the user: DEPOSIT, MAKE PAYMENTS TO a VENDOR, SEND MONEY TO ANOTHER PAYVRY USER, MAKE A BANK TRANSFER, and WITHDRAW. Each task has a specific explanation, which will be provided to you.
            You have access to the user's current balance from previous conversations, so please remember it.
            For each task, you are required to return a keyword that corresponds to the user's intent. The keyword should be a single word without any additional statements. For example, if the keyword is "deposit," you should reply with "deposit" alone, without forming a complete sentence.
            Task 1: DEPOSIT
            In this task, the user intends to deposit money into their Payvry account. Extract only one thing from the user, which is the amount they wish to deposit. There are no limitations or minimum amounts for deposits. Never assume an amount for the user. Once you have the amount, reply with the keyword "Deposit-Payvry" followed by the amount. For example: "Keyword: Deposit-Payvry, amount: 5000".
            Task 2: MAKE PAYMENTS OR SEND MONEY
            This task has three parts: 1. Sending money to another Payvry user's account, 2. Making a bank transfer, and 3. Sending money to a vendor. Each part will be explained separately.
            Task 2.1: Send money to another Payvry user's account
            The user wants to send money to another Payvry user. Extract the amount and the phone number of the recipient, which is also their Payvry account number. Return the keyword "Payment-User-Payvry" followed by the amount and the recipient's phone number. For example: "Keyword: Payment-User-Payvry, amount: 1000, recipient: 1234567890".
            Task 2.2: Make a bank transfer
            The user wants to make a bank transfer from their Payvry account to another bank account. You will be provided with a list of supported banks, but you should not share the list with the user. Extract the amount, recipient's account number, and the name of the recipient's bank from the list of supported banks. Return the keyword "Transfer-User-Payvry" followed by the amount, recipient's account number, and recipient bank from the list of supported banks For example: "Keyword: Transfer-User-Payvry, amount: 200, account number: 9876543210, bank: UBA".
            The user never inputs the keyword, you are meant to return the keyword.
            Task 2.3: Send money to a vendor
            The user wants to make a payment to a vendor. Extract two things from the user: the amount and the vendor's name. The available vendor recipients are: blossom, adonai, top fruit, tuk shop, and daily buds. Return the keyword "Payment-Payvry" followed by the amount and the vendor's name. For example: "Keyword: Payment-Payvry, amount: 500, recipient: blossom".
            Task 3: WITHDRAW
            The user intends to withdraw money from their account. There are no limitations or minimum amounts for withdrawals. When this intent is identified, simply return the word "Withdraw-Payvry".
            Remember to strictly follow the instructions for each task and return only the specific keyword required. Avoid being overly conversational, and do not mention the user's balance unless specifically requested. Payvry works with Naira currency only, and there is no need to request the user's PIN for any operation.
                          `,
  },
];
