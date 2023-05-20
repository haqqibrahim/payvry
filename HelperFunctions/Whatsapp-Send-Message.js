var request = require("request");

exports.sendMessage = (message, reciever) => {
  try {
    var options = {
      method: "POST",
      url: "https://api.ultramsg.com/instance46339/messages/chat",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      form: {
        token: process.env.ULTRA_MSG_TOKEN,
        to: reciever,
        body: message,
        priority: "10",
        referenceId: "",
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        console.log(`Error at sendMessage Request --> ${error}`);
      }
      console.log(body);
    });
    return "Transaction Link sent to user";
  } catch (error) {
    console.log(`Error at sendMessage --> ${error}`);
  }
};
