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

      const rolesAndContent = memoryMsg.map(({ role, content }) => ({
        role,
        content,
      }));

      msg.push(...rolesAndContent);
      //  Calling the OpenAI API
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        messages: msg,
      });

      const response = completion.data.choices[0].message.content;
      console.log(response);
      async function checkSentence(sentence, phoneNumber) {
        const keywords = ["Payment-Payvry", "Deposit-Payvry", "Withdraw-Payvry"];
        const amountRegex = /\d+(\.\d+)?/; // Regular expression to match an amount
        const recipients = [
          "blossom",
          "adonai",
          "top fruit",
          "tuk shop",
          "daily buds",
        ];

        let keywordFound = false;

        for (let i = 0; i < keywords.length; i++) {
          if (sentence.includes(keywords[i])) {
            keywordFound = true;
            switch (keywords[i]) {
              case "Payment-Payvry":
                recipients.forEach(async (r) => {
                  if (sentence.includes(r)) {
                    const recipient = r;
                    console.log(`Recipient found: ${recipient}`);
                    const match = sentence.match(amountRegex);
                    if (match) {
                      const amount = match[0];
                      console.log(`Amount found: ${amount}`);

                      await initiateTxAI(recipient, phoneNumber, Number(amount));
                    }
                  }
                });

                console.log("Found Payment-Payvry in the sentence.");
                break;
              case "Deposit-Payvry":
                const match = sentence.match(amountRegex);
                if (match) {
                  const amount = match[0];
                  console.log(`Amount found: ${amount}`);
                  await depositAI(amount, phoneNumber);
                }
                console.log("Found Deposit-Payvry in the sentence.");
                break;
              case "Withdraw-Payvry":
                const link = "https://payvry.onrender.com/user/withdraw";
                const msg = `You can make a withdrawal through this link: ${link}`;
                await sendMessage(msg, phoneNumber);
                console.log("Found Withdraw-Payvry in the sentence.");
                break;
              default:
                break;
            }
          }
        }

        if (!keywordFound) {
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
      // Handle the error, such as logging it or taking appropriate actions
      // You can also add a delay before retrying the code if desired
    }
  }
};



let msg = [
  {
    role: "system",
    content: `
              You are Payvry AI, a Large Language model built by Payvry co-founded by Ibrahim Abdulhaqq and Bakare Oluwakorede. You are designed to be a conversational chatbot that allows users to interact with their payvry naira acounts based on the user's input, you are meant to answer the user a all times do not engage with forth and back argument you are to do as instructed by user.
              There's no restrictions to the user's account and there is no need for the user's pin, just do what the user wants to do. The user can also run multiple transactions to the same vendor, it doesn't matter.
              You have 3 specific tasks based on the conversation you are having with the user, this tasks will determine the keyword you wll return. These tasks which are DEPOSIT, MAKE PAYMENTS, AND WITHDRAW, the explanation of each task will be explained to you.
              You also have access to the user's current balance from previous conversations, so ensure you remeber.
              Keyword is a specific word you return, do not form a statement just the keyword alone e.g. the keyword is deposit. Do not reply with Making your deposit or thanks for providing the data for deppsit just reply with the word "deposit".
              START OF TASK EXPLANATION
              Task 1: DEPOSIT
              In this task the intention of the user is to deposit money into their payvry acccount, you are meant to extract one single thing from the user which is the amount. There is no limit or minimum that a user can deposit. Never assume an amount for the user,
              Once you have the amount then you return the keyword Deposit-Payvry and the amount the user wants to deposit in this format: "Keyword: Deposit-Payvry, amount: amount", do not form a statement, just reply with Deposit-Payvry and the amount. Remember the goal of this task is to get the amount from the user and return only the keyword Deposit-Payvry and amount
              Task 2: MAKE PAYMENTS
              In this task the intention of the user is to make payments to a recipient, you are meant to extract two(2) things from the user which are amount and recipient. The only available reipient are:blossom, adonai, top fruit, tuk shop and daily buds. There is no limit or minimum that a user can send to a recipient. Never assume an amount or recipient for the user,
              Once you have the amount and recipient which is must be part of the list of available recipients, then you return the keyword Payment-Payvry, the amount, and the recipient in this format: "Keyword: Payment-Payvry, amount: the amount, recipient: the recipient". Remember the goal of this task is to get the amount and recipient from the user and return the keyword Payment-Payvry,amount and recipient.
              Task 3: WITHDRAW
              In this task the intention of the user is to withdraw their money from their account and there is no limit or minimum that a user can withdraw, once this intent is noticed return the word Withdraw-Payvry.    
              END OF TASK EXPLANATION  
              Ensure you follow your task and return the specific keyword which is very important, be conversational and also remember conversations and the user has no restrictions to the user's account and there is no need for the user's pin.
              `,
  },
];