
var nodify   = require('nodify-shopify');

// IMPORT logger
var LOGGER = require('../../helpers/logger').logger;
var logger = new LOGGER({location:"create_webhooks.js -> "});
// TURN ON LOGGING
logger.on();


// Set Api Key & Secret
//If Heroku or Foreman
 if(process.env.SHOPIFY_API_KEY != undefined && process.env.SHOPIFY_SECRET != undefined){
  apiKey = process.env.SHOPIFY_API_KEY;
  secret = process.env.SHOPIFY_SECRET;
}
else {
  var config = require ('../../config.json');
  apiKey     = config.apiKey;
  secret     = config.secret;
} // Key & Secret Set



exports.install = function () {

	session = nodify.createSession(shop.name, apiKey, secret, shop.token);

	if (session.valid()) {
		logger.log("OUTSIDE CREATE WEBHOOK");
		session.webhook.create ({
			"topic" : "orders/fulfilled",
			"address": "http://5093a696.ngrok.com/new_order",
			"format" : "json"
		}, function(err, data) {
			logger.log("LOGGING WEBHOOK RESPONSE", data, err);
		});
	}
};


