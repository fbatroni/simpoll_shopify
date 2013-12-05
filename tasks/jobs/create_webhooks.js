
var nodify   = require('nodify-shopify'),
	Shop     = require('../../model/shop');

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


exports.install = function install(shop) {

	try {

		session = nodify.createSession(shop.name, apiKey, secret, shop.token);

		if (session.valid()) {
			logger.log("OUTSIDE CREATE WEBHOOK");
			session.webhook.create ({
				"topic" : "orders/fulfilled",
				"address": "https://5093a696.ngrok.com -> 127.0.0.1:3000/new_order",
				"format" : "json"
			}, function(err, data) {
				logger.log("LOGGING WEBHOOK RESPONSE", data, err);
			});
		}
		logger.log("Webhook run successfully");

	} catch(err) {
		logger.log("Exception: Shop Not Ready!", err);
		install();
	}
};


