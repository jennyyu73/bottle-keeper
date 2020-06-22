require('dotenv').config()
const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Handles messages events
function handleMessage(sender_psid, received_message) {

  let response;

  if (received_message.quick_reply) {
    if(received_message.quick_reply === "findBottleYes") {
        response = {
            "recipient": {
              "id": sender_psid
            },
            "message": {
                "text": "Aight, Ima look for a bottle"
            }
        }
    }
    else if (received_message.quick_reply === "findBottleNo") {
        response = {
            "recipient": {
              "id": sender_psid
            },
            "message": {
                "text": "Aight, I'm going to go sleep"
            }
        }
    }
  }

  // Check if the message contains text
  else if (received_message.text) {

    // Create the payload for a basic text message
    response = {
        "recipient": {
          "id": sender_psid
        },
        "message":{
            "text": "Would you like for me to find a bottle?",
            "quick_replies":[
              {
                "content_type":"text",
                "title":"Yes",
                "payload": "findBottleYes"
              },{
                "content_type":"text",
                "title":"No",
                "payload": "findBottleNo"
              }
            ]
          }
      }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    console.log("Hi")
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = response
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v7.0/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

module.exports = { handlePostback, handleMessage, callSendAPI }
