var request = require("request");
const whatsAppClient = require("@green-api/whatsapp-api-client");
const restAPI = whatsAppClient.restAPI({
  idInstance: "1101830165",
  apiTokenInstance: "5b6f330cf2b94482bdb53ab3b22f17acb877a6d47d364a06b3",
});
exports.sendMessage = async (message, receiver) => {
  try {
    const convertedNumber = "234" + receiver.slice(1) + "@c.us";
    console.log(`TheMessage: ${message}`);
    console.log(typeof message);
    console.log(typeof Number(receiver));
    // Send test message that triggers webhook
    const response = await restAPI.message.sendMessage(
      convertedNumber,
      null,
      message
    );
    console.log(`Response: ${JSON.stringify(response)}`);
    return;
    // sendRequest(options);
  } catch (error) {
    console.error(`Error at sendMessage --> ${error}`);
  }
};
