require('dotenv').config()
const request = require('request');
var Sentiment = require('sentiment');
var sentiment = new Sentiment();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
var fetch = require('node-fetch');
var sendBottleBoolean = false;

function CleanJSONQuotesOnKeys(json) {
  return json.replace(/"(\w+)"\s*:/g, '$1:');
}

// Handles messages events
async function handleMessage(sender_psid, webhook_event) {
  var received_message = webhook_event.message;
  let responses = [];

  if(sendBottleBoolean) {
    console.log("SEND BOTTLE");
    var score = sentiment.analyze(received_message.text).score;
    sendBottleBoolean = false;
<<<<<<< HEAD
    if(score < 0) {
        responses.push({
            "recipient": {
                "id": sender_psid
            },
            "message": {
                "text": `Wow... that was mean of you. Wake up again once you have something nicer to say.`
            }
        });
    }
    else {
        responses.push({
            "recipient": {
                "id": sender_psid
            },
            "message": {
                "text": `I'm sending your message "${received_message.text}" in a bottle right now.`
            }
        });
        responses.push({
            "recipient": {
              "id": sender_psid
            },
            "message":{
                "text": "Would you like for me to do anything else?",
                "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Search",
                    "payload": "findBottleCommand"
                  },{
                    "content_type":"text",
                    "title":"Send",
                    "payload": "sendBottleCommand"
                  }, {
                    "content_type":"text",
                    "title":"Sorry, Neither",
                    "payload": "cancelCommand"
                  }
                ]
              }
            });

        //add the bottle message to the database along with PSID
        var bottle = {
          psid: sender_psid,
          message: received_message.text
        };
        var bottleQuery = `
        mutation{
          addBottle(id: "5ef1491dec535c15b475a8d0", bottle: ${CleanJSONQuotesOnKeys(JSON.stringify(bottle))}){
            bottles{
              message
              psid
            }
          }
        }`;
        var bottleRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + bottleQuery, {method: "POST"});
        var bottleResJson = await bottleRes.json();

        //get all pairs of bottles that need to be sent
        var pairsQuery = `
        mutation{
          getMessageTokenPair(bottlesId: "5ef1491dec535c15b475a8d0", tokensId: "5ef14940ec535c15b475a8d1"){
            message
            token
          }
        }`;
        var pairsRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + pairsQuery, {method: "POST"});
        var pairsResJson = await pairsRes.json();
        console.log('pairs result', JSON.stringify(pairsResJson));
        if (pairsResJson.data.getMessageTokenPair != null){
          for (let i = 0; i < pairsResJson.data.getMessageTokenPair.length; i ++){
            responses.push({
              "recipient": {
                "one_time_notif_token": pairsResJson.data.getMessageTokenPair[i].token
              },
              "message": {
                "text": `I found a bottle for you! It says "${pairsResJson.data.getMessageTokenPair[i].message}"`
              }
            });
          }
        }
=======
    responses.push({
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "text": `I'm sending your message "${received_message.text}" in a bottle right now.`
        }
    });

    //add the bottle message to the database along with PSID
    var bottle = {
      psid: sender_psid,
      message: received_message.text
    };
    var bottleQuery = `
    mutation{
      addBottle(id: "5ef1491dec535c15b475a8d0", bottle: ${CleanJSONQuotesOnKeys(JSON.stringify(bottle))}){
        bottles{
          message
          psid
        }
      }
    }`;
    var bottleRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + bottleQuery, {method: "POST"});
    var bottleResJson = await bottleRes.json();

    //get all pairs of bottles that need to be sent
    var pairsQuery = `
    mutation{
      getMessageTokenPair(bottlesId: "5ef1491dec535c15b475a8d0", tokensId: "5ef14940ec535c15b475a8d1"){
        message
        token
      }
    }`;
    var pairsRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + pairsQuery, {method: "POST"});
    var pairsResJson = await pairsRes.json();
    console.log('pairs result', JSON.stringify(pairsResJson));
    if (pairsResJson.data.getMessageTokenPair != null){
      for (let i = 0; i < pairsResJson.data.getMessageTokenPair.length; i ++){
        responses.push({
          "recipient": {
            "one_time_notif_token": pairsResJson.data.getMessageTokenPair[i].token
          },
          "message": {
            "text": `I found a bottle for you! It says "${pairsResJson.data.getMessageTokenPair[i].message}"`
          }
        });
      }
>>>>>>> e51884b82bb03d5592d92a30476da8d4ac6f92ce
    }
  }
  else if(received_message){
    if (received_message.quick_reply) {
      if(received_message.quick_reply.payload === "sendBottleCommand") {
        responses.push({
          "recipient": {
            "id": sender_psid
          },
          "message": {
              "text": "Splendid! What message would you like to send?",
              "metadata": "botResponseSend"
          }
        });
      }
      else if (received_message.quick_reply.payload === "findBottleCommand") {
        console.log("FIND")
        responses.push({
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
        });
<<<<<<< HEAD
      }
      else if (received_message.quick_reply.payload === "cancelCommand") {
        responses.push({
          "recipient": {
            "id": sender_psid
          },
          "message": {
              "text": "Oh okay, wake me up when you need my services!"
          }
        });
=======
>>>>>>> e51884b82bb03d5592d92a30476da8d4ac6f92ce
      }
    }

    // Check if the message contains text
    else if (received_message.text) {
      // Create the payload for a basic text message
      console.log("PAYLOAD")
      responses.push({
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
              }, {
                "content_type":"text",
                "title":"Sorry, Neither",
                "payload": "cancelCommand"
              }
            ]
          }
        });
      }
    }
    else if (webhook_event.optin){
      responses.push({
          "recipient": {
            "id": sender_psid
          },
          "message": {
              "text": "Will do!"
          }
      });
<<<<<<< HEAD
      responses.push({
            "recipient": {
              "id": sender_psid
            },
            "message":{
                "text": "Would you like for me to do anything else?",
                "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Search",
                    "payload": "findBottleCommand"
                  },{
                    "content_type":"text",
                    "title":"Send",
                    "payload": "sendBottleCommand"
                  }, {
                    "content_type":"text",
                    "title":"Sorry, Neither",
                    "payload": "cancelCommand"
                  }
                ]
              }
            });
=======
>>>>>>> e51884b82bb03d5592d92a30476da8d4ac6f92ce
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

      //tries to send the bottles that it can
      //get all pairs of bottles that need to be sent
      var pairsQuery = `
      mutation{
        getMessageTokenPair(bottlesId: "5ef1491dec535c15b475a8d0", tokensId: "5ef14940ec535c15b475a8d1"){
          message
          token
        }
      }`;
      var pairsRes = await fetch("https://bottlekeeper.herokuapp.com/graphql?query=" + pairsQuery, {method: "POST"});
      var pairsResJson = await pairsRes.json();
      console.log('pairs result', JSON.stringify(pairsResJson));
      if (pairsResJson.data.getMessageTokenPair != null){
        for (let i = 0; i < pairsResJson.data.getMessageTokenPair.length; i ++){
          responses.push({
            "recipient": {
              "one_time_notif_token": pairsResJson.data.getMessageTokenPair[i].token
            },
            "message": {
              "text": `I found a bottle for you! It says "${pairsResJson.data.getMessageTokenPair[i].message}"`
            }
          });
        }
      }
    }
  console.log(sendBottleBoolean);
  if(received_message && received_message.metadata === "botResponseSend") {
    sendBottleBoolean = true;
  }
  // Sends the response message
  callSendAPI(sender_psid, responses);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    console.log("Hi");
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, responses) {
  // Construct the message body
  for (let i = 0; i < responses.length; i++){
    let request_body = responses[i];
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
}

module.exports = { handlePostback, handleMessage, callSendAPI }
