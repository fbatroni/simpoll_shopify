
var nodify   = require('nodify-shopify'),
  Customer = require('../../model/customer'),
	Shop       = require('../../model/shop');

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

// Helpers
function ISOToDate(ISOString) {
  return new Date(ISOString);
}

// Save the customer object that the customer field in the Order Object will point to
// This is so we can use the _id value of that object as a ref
function saveOrderCustomer(order, callback) {
  Customer.save(order._customer, function (err, customer) {
    if (err) callback(err);
    else callback(null, customer);
  })
}

exports.install = function install(shop) {

	try {

		session = nodify.createSession(shop.name, apiKey, secret, shop.token);

		if (session.valid()) {
			logger.log("OUTSIDE CREATE WEBHOOK");
			session.webhook.create ({
				"topic" : "orders/fulfilled",
				"address": "http://elimence.ngrok.com/new_order",
				"format" : "json"
			}, function(err, data) {
				// logger.log("LOGGING WEBHOOK RESPONSE", data, err);
        if (err) throw err;
        else {
          // Prepare Order Data & Save
          Shop.daysToWait(shop.name, function (err, daysToWait) { //Get shops waiting time prior to sending reviews
            if (err) throw err;
            else {
              // Set date for customer to be asked for a review
              var reviewSendDate = ISOToDate(data.updated_at);
              reviewSendDate.setDate(reviewSendDate.getDate() + daysToWait);

              // Get an array of Line Item IDs
              var shopifyProudctIDS = [];
              for (var i = 0; i < data.line_items.length; i++) {
                shopifyProudctIDS.push(data.line_items[i].product_id);
              }

              // The customers info
              var theCustomer = {
                firstName   : data.customer.first_name,
                lastName    : data.customer.last_name,
                email       : data.customer.email,
                shopifyID   : data.customer.id
              };

              // Interim Order Object
              var order = {
                id: data.id,
                name: data.name,
                totalItems: data.line_items.length,
                fulfilled_at: data.fulfillment_status,
                placed_at: data.created_at,
                review_sceduled_for: reviewSendDate,
                reviewSent: false,
                customer: {},
                products: shopifyProudctIDS,
                _shop: shop.name
              };

              // Fetch customer data for associating with this new order or 
              // Save new customer if no existing customer matches
              Customer.byShopifyID(data.customer.id, function (err, customer) {
                if (err) throw err;
                if (customer) { // Customer exists, so associate the new order with this customer
                  order.customer = customer._id;
                  // Now save the order
                  Order.save(order, function (err, savedOrder) {
                    if (err) throw err;
                    else logger.log('Saved Order: ', savedOrder);
                  })
                } else { // No match, Create new customer
                  Customer.save(, function (err, newCustomer) {
                  if (err) throw err;
                    order.customer = customer._id;
                    // Now save the order
                    Order.save(order, function (err, savedOrder) {
                      if (err) throw err;
                      else logger.log('Saved Order: ', savedOrder);
                    })
                  });
                }
              })
            }
          });
        }
			});
		}
		logger.log("Webhook run successfully");
	} catch(err) {
		logger.log("Exception: Shop Not Ready!", err);
		// install();
	}
};


