require('dotenv').config()
const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

var sendBottleBoolean = false;

// Handles messages events
function handleMessage(sender_psid, received_message) {

  let response;
  if(sendBottleBoolean) {
    console.log("HI")
    sendBottleBoolean = false;
    response = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": `You're about to send "${received_message.text}"`
        }
    }
  }
  //If a quick reply
  else if (received_message.quick_reply) {
    if(received_message.quick_reply.payload === "sendBottleCommand") {
        sendBottleBoolean = true;
        response = {
            "recipient": {
              "id": sender_psid
            },
            "message": {
                "text": "Splendid! What message would you like to send?"
            }
        }
    }
    else if (received_message.quick_reply.payload === "findBottleCommand") {
        sendBottleBoolean = false;
        response = {
            "recipient": {
              "id": sender_psid
            },
            "message": {
                "text": "Okay, I will be searching for a bottle."
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
            "text": "Would you like to send a bottle or have me search for one?",
            "quick_replies":[
              {
                "content_type":"text",
                "title":"Search",
                "payload": "findBottleCommand"
              },{
                "content_type":"text",
                "title":"Send",
                "payload": "sendBottleCommand"
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
