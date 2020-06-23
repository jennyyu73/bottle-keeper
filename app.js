require('dotenv').config()
const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
var fetch = require('node-fetch');
var sendBottleBoolean = false;

function CleanJSONQuotesOnKeys(json) {
  return json.replace(/"(\w+)"\s*:/g, '$1:');
}

// Handles messages events
async function handleMessage(sender_psid, webhook_event) {
  var received_message = webhook_event.message;
  console.log(sendBottleBoolean);
  let response;
  if(sendBottleBoolean) {
    sendBottleBoolean = false;
    response = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": `You're about to send "${received_message.text}"`
        }
    };

    //add the bottle message to the database along with PSID
    var bottle = {
      psid: sender_psid,
      message: received_message.text
    };
    var bottleQuery = `
    mutation{
      addBottle(id: "5ef1491dec535c15b475a8d0", bottle: ${JSON.stringify(bottle)}){
        bottles{
          message
          psid
        }
      }
    }`;
    var bottleRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + bottleQuery, {method: "POST"});
    var bottleResJson = await bottleRes.json();
  }
  else if(received_message){
    if (received_message.quick_reply) {
      if(received_message.quick_reply.payload === "sendBottleCommand") {
        sendBottleBoolean = true;
        response = {
          "recipient": {
            "id": sender_psid
          },
          "message": {
              "text": "Splendid! What message would you like to send?",
              "metadata": "hahaha"
          }
        };
      }
      else if (received_message.quick_reply.payload === "findBottleCommand") {
        sendBottleBoolean = false;
        response = {
          "recipient": {
            "id": sender_psid
          },
          "message": {
            "attachment": {
              "type":"template",
              "payload": {
                "template_type": "one_time_notif_req",
                "title": "Would you like to be notified when I find a bottle?",
                "payload": "notify"
              }
            }
          }
        };
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
        };
      }
    }
    else if (webhook_event.optin){
      response = {
          "recipient": {
            "id": sender_psid
          },
          "message": {
              "text": "Will do!"
          }
      };
      var token = {
        token: webhook_event.optin.one_time_notif_token,
        psid: sender_psid
      };
      var tokenQuery = `
      mutation{
        addToken(id: "5ef14940ec535c15b475a8d1", token: ${CleanJSONQuotesOnKeys(JSON.stringify(token))}){
          tokens {
            token
            psid
          }
        }
      }`;

      var tokenRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + tokenQuery, {method: "POST"});
      var tokenResJson = await tokenRes.json();
    }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    console.log("Hi");
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
