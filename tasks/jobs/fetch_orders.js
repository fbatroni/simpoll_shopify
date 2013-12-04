// Module Dependencies
var nodify   = require('nodify-shopify'),
	Shop     = require('../../model/shop'),
	Order    = require('../../model/order'),
	Customer = require('../../model/customer'),
	Preferences = require('../../model/preferences'),
	step     = require('async');

// Config Vars
var apiKey, secret, session = {},
	shop, shopToken;

// IMPORT logger
var LOGGER = require('../../helpers/logger').logger;
var logger = new LOGGER();
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

function getOrdersForShop(shop, callback) {
	session = nodify.createSession(shop.name, apiKey, secret, shop.token);

	// if (session.valid()) {
	// 	console.log("OUTSIDE CREATE WEBHOOK");
	// 	session.webhook.create ({
	// 		"topic" : "orders/fulfilled",
	// 		"address": "http://5093a696.ngrok.com/new_order",
	// 		"format" : "json"
	// 	}, function(err, data) {
	// 		console.log("LOGGING WEBHOOK RESPONSE", data, err);
	// 	});
	// }

	// if(session.valid()){
	// 	if (shop.latestOrderDate) {
	// 		shop.latestOrderDate.setSeconds(shop.latestOrderDate.getSeconds() + 1); // Set latest order date a millisecond after what it really is - This prevents us fetching the current latest order again
	// 	} else {
	// 		shop.created_at.setHours(shop.created_at.getHours() - 5); // Convert to EST
	// 	}
	// 	session.order.all({
	// 		created_at_min: (shop.latestOrderDate) ? shop.latestOrderDate.toISOString() : shop.created_at.toISOString()
	// 	}, function(err, orders){
	// 		if (err) callback(err);
	// 		else {
	// 			Shop.daysToWait(shop.name, function (err, waitDays) {
	// 				if (err) callback(err);
	// 				else {
	// 					var _orders = [];
	// 					orders.forEach(function (item, index) {

	// 						var reviewSendDate = ISOToDate(item.updated_at);
	// 						reviewSendDate.setDate(reviewSendDate.getDate() + waitDays);
	// 						var _order = {
	// 							id: item.id,
	// 							name: item.name,
	// 							totalItems: item.line_items.length,
	// 							fulfilled_at: item.fulfillment_status,
	// 							placed_at: item.created_at,
	// 							review_sceduled_for: reviewSendDate,
	// 							reviewSent: false,
	// 							_customer: {
	// 								firstName: item.customer.first_name,
	// 								lastName: item.customer.last_name,
	// 								email: item.customer.email
	// 							},
	// 							_products: [],
	// 							_shop: shop.name
	// 						};
	// 						for (var i = 0; i < item.line_items.length; i++) {
	// 							_order._products.push(item.line_items[i].product_id);
	// 						}
	// 						_orders.push(_order);
	// 					});
	// 					callback(null, _orders);
	// 				}
	// 			});
	// 		}
	// 	});
	// }
}

function getAllOrders(shops, callback) {
	step.mapSeries(shops, getOrdersForShop, function(err, orders){
	    if (err) callback(err);
	    else callback(null, orders);
	});
}

function saveOrderCustomer(order, callback) {
	Customer.save(order._customer, function (err, customer) {
		if (err) callback(err);
		else callback(null, customer);
	})
}

function saveOrdersForShop(shopOrders, callback) {
	step.mapSeries(shopOrders, saveOrderCustomer, function (err, customers) {
		if (err) callback(err);
		shopOrders.forEach(function (item, index) {
			item.customer = customers[index]._id;
			item.products = item._products;
		});

		if (shopOrders.length) {
			var shopName = shopOrders[0]._shop;
			step.waterfall([
			    function(callback){
			    	Shop.findByName(shopName, function (err, shop) {
			    		if (err) callback(err);
			    		else callback(null, shop);
			    	});
			    },
			    function(_shop, callback){
			    	Order.save(shopOrders, function (err, savedOrders) {
			    		if (err) callback(err);
			    		else callback(null, _shop, savedOrders);
			    	})
			    },
			    function(_shop, _savedOrders, callback){
			    	Shop.saveOrders(_shop, _savedOrders, function (err) {
			    		if (err) callback(err);
			    		else callback(null, _shop.name + ' orders saved');
			    	})
			    }
			], function (err, res) {
				if (err) callback(err);
				else callback(null, res);
			});
		} else {
			callback(null, 'a shop has no orders to save');
		}

	});
}

function saveShopsOrders(ordersAllShops, callback) {
	step.map(ordersAllShops, saveOrdersForShop, function (err, saved) {
		if (err) callback(err);
		else callback(null, saved);
	});
}

function getLatestOrderDate(shop, callback) {
	Order.latestByShop(shop.name, function (err, latestOrder) {
		if (err) callback(err);
		shop.latestOrderDate = (latestOrder) ? latestOrder.placed_at : null;
		callback(null, shop);
	})
}

function getLatestOrderDates(shops, callback) {
	step.map(shops, getLatestOrderDate, function (err, _shops) {
		if (err) callback(err);
		else callback(null, _shops);
	});
}

function fetchOrders() {
	// Begin fetchin orders
	logger.log('FetchOrders Job Initializing...');
	step.waterfall([
	    function(callback){
	    	Shop.all(function (err, shops) { // Grab all shops
	    		if (err) callback(err);
	    		else callback(null, shops);
	    	});
	    },
	    function(shops, callback){
	    	getLatestOrderDates(shops, function (err, _shops) { // Fetches most recent order dates for all shops
	    		// logger.log(_shops);
	    		if (err) callback(err);
	    		else callback(null, _shops);
	    	});
	    },
	    function(shops, callback){
	        getAllOrders(shops, function(err, allOrders) { // Get all relevant orders for all shops
	        	if (err) callback(err);
	        	else callback(null, allOrders)
	        })
	    },
	    function(ordersAllShops, callback){
	        saveShopsOrders(ordersAllShops, function (err, saved) { // Saves the received orders for all shops
	        	if (err) callback(err);
	        	else callback(null, saved);
	        });
	    }
	], function (err, results) {
	   	if (err) throw err;
	  	logger.log(results);
	});
} // End of Helper functions

// Expose Functionality
exports.init = fetchOrders;

// setTimeout(fetchOrders, 10000);

// fetchOrders();
