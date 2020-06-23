'use strict';
var tool = require('./app')
// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server
  mongoose = require('mongoose'),
  fetch = require('node-fetch'),
  dbRoute = 'mongodb+srv://jenny:hY132tQAy1OEr5ZH@cluster0-v0ju3.azure.mongodb.net/BottleKeeper?retryWrites=true&w=majority';
const graphqlHTTP = require('express-graphql');
const Bottles = require('./data/bottles'); //5ef1491dec535c15b475a8d0
const Tokens = require('./data/tokens'); //5ef14940ec535c15b475a8d1
const schema = require('./data/schema');


// connects our back end code with the database
mongoose.connect(
  dbRoute,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//this represents our connection to the database
let db = mongoose.connection;

//if the connection (db) is successful, let the user know
db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is invalid
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//pass in access token to graphql end point
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql:true
}));

// Sets server port and logs message on success
app.listen(process.env.PORT || 3000,
  () => console.log(`webhook is listening on port ${process.env.PORT || 3000}`));

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log('WEBHOOK EVENT', webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message || webhook_event.optin) {
        tool.handleMessage(sender_psid, webhook_event);
      } else if (webhook_event.postback) {
        tool.handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "jenny73"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


//EAANYSME8MD4BAIaavaxoDrHAQEj63jLF9bjZAu6IKJbo3PACQMsxOpm5tayYHMkbsEHG9yN75jugdDcZBKlXV2Azrskdg8h4hD6Ox4IwbT42F6mVP7IjTFSpZA9s387dkQJtNlQBYtspcAwL5UZCjq737YH17U06FgWiPoZB8xQZDZD
