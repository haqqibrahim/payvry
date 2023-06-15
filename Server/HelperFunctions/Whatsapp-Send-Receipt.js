var request = require("request");
const whatsAppClient = require("@green-api/whatsapp-api-client");
const restAPI = whatsAppClient.restAPI({
  idInstance: "1101830165",
  apiTokenInstance: "5b6f330cf2b94482bdb53ab3b22f17acb877a6d47d364a06b3",
});

exports.sendReciept = async (url, receiver) => {
  try {
    const convertedNumber = "234" + receiver.slice(1) + "@c.us";
    
    const imageURL= `${url}`
    const fileName = "reciept.png";
    const caption = "reciept";
    console.log(`The URL: ${imageURL}`);
    console.log(typeof imageURL)
    // Send test message that triggers webhook
    const response = await restAPI.file.sendFileByUrl(
      convertedNumber,
      null,
      imageURL,
      fileName,
      caption
    );
    console.log(`Receipt Response: ${JSON.stringify(response)}`);
    return;
    // sendRequest(options);
  } catch (error) {
    console.error(`Error at send Reciept-> ${error}`);
  }
};
