var request = require("request");

exports.sendMessage = (message, receiver) => {
  try {
    var options = {
      method: "POST",
      url: "https://api.ultramsg.com/instance49300/messages/chat",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      form: {
        token: process.env.ULTRA_MSG_TOKEN,
        to: receiver,
        body: message,
        priority: "10",
        referenceId: "",
      },
    };

    function sendRequest(options) {
      request(options, (error, response, body) => {
        if (error) {
          console.log(`Error at sendMessage Request --> ${error}`);
          // Retry the function with the same parameters
          sendRequest(options);
        } else {
          // console.log(response);
          console.log(body);
        }
      });
    }

    sendRequest(options);
  } catch (error) {
    console.log(`Error at sendMessage --> ${error}`);
  }
};
