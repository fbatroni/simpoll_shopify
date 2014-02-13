
var nodify   = require('nodify-shopify'),
    Shop     = require('../../model/shop');

// IMPORT logger
var LOGGER = require('../../helpers/logger').logger;
var logger = new LOGGER({location:"create_webhooks.js -> "});
// TURN ON LOGGING
logger.on();


// Set Api Key & Secret
//If Heroku or Foreman
 //if(process.env.SHOPIFY_API_KEY != undefined && process.env.SHOPIFY_SECRET != undefined){
  apiKey = process.env.SHOPIFY_API_KEY;
  secret = process.env.SHOPIFY_SECRET;
  url    = process.env.URL || "http://simpoll.ngrok.com";
// }
// else {
//   var config = require ('../../config.json');
//   apiKey     = config.apiKey;
//   secret     = config.secret;
// } // Key & Secret Set



exports.install = function install(shop, callback) {

	session = nodify.createSession(shop.name, apiKey, secret, shop.token);

	if (session.valid()) {
		logger.log("OUTSIDE CREATE WEBHOOK");
    session.webhook.count(function(err, data) {
      logger.log("here's the count", err, data);
    });

		session.webhook.create ({
			"topic" : "orders/fulfilled",
			"address": url + "/new_order",
			"format" : "json"
		}, function(err, data) {
      if (err) callback(err);
      else callback(null, data, false);
		});
  } else {
    callback(null, null, true);
  }

};


