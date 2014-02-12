/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	db = require('./db'),
	Shop = require('./shop'),
	Customer = require('./customer'),
	Product = require('./product'),
	Preferences = require('./preferences'),
	Order = mongoose.model('Order'),
	step = require('async');

function all(callback) {
	Order.find()
	.sort('-created_at')
	.exec(function (err, orders) {
		if (err) callback(err);
		callback(null, orders);
	});
}

function save(orders, callback) {
	orders = (orders instanceof Array) ? orders : [orders];
	Order.create(orders, function (err) {
		if (err) callback(err);
		else {
			var saved = Array.prototype.slice.call(arguments, 1);
			callback(null, saved);
		}
	});
}

function _getProductInfo(productID, callback) {
	Product.findByShopifyID(productID, function (err, product) {
		if (err) callback(err);
		else callback(null, product);
	});
}

function _getProductsInfo(products, callback) {
	step.map(products, _getProductInfo, function (err, _products) {
		if (err) callback(err);
		else callback(null, _products);
	});
}

function emailInfo(order, callback) {
	var info = {};
	step.waterfall([
	    function(callback){
	    	Shop.findByName(order._shop, function (err, shop) {
	    		if (err) callback(err);
	    		else callback(null, shop);
	    	});
	    },
	    function(shop, callback){
	    	Customer.findByID(order.customer, function (err, customer) {
	    		if (err) callback(err);
	    		else callback(null, shop, customer);
	    	});
	    },
	    function(shop, customer, callback){
	    	_getProductsInfo(order.products, function (err, products) {
	    		if (err) callback(err);
	    		else callback(null, shop, customer, products);
	    	});
	    },
	    function(shop, customer, products, callback){
	    	Preferences.findByID(shop.preferences,
	    		function (err, preferences) {
	    			if (err) callback(err);
	    			else callback(null, shop, customer, products, preferences);
	    		});
	    }
	], function (err, shop, customer, products, preferences) {
		if (err) callback(err);
		else {
			info.orderID = order._id;
			info.shopifyOrderID = order.id;
			info.shop = shop.name;
			info.emailSubject = preferences.messageSubject;
			info.emailBody = preferences.messageBody;
			info.emailSignature = preferences.messageSignature;
			info.sentFrom = preferences.showAsSentFrom;
			info.messageGreeting = preferences.messageGreeting.replace('<customer>', customer.firstName);
			info.customer = {
				firstName: customer.firstName,
				lastName: customer.lastName,
				email: customer.email,
				customer_id: customer._id
			};
			info.products = products;
			callback(null, info);
		}
	});
}

function getLatest(callback) {
	Order.find()
	.sort('-placed_at')
	.limit(1)
	.exec(function (err, orders) {
		if (err) callback(err);
		else if (orders.length) {
			callback(null, orders[0]);
		} else callback(null, null);
	});
}

function getLatestByShop(shopName, callback) {
	Order.find()
	.where('_shop').equals(shopName)
	.sort('-placed_at')
	.limit(1)
	.exec(function (err, orders) {
		if (err) callback(err);
		else if (orders.length) {
			callback(null, orders[0]);
		} else callback(null, null);
	});
}

function byID(id, callback) {
	Order.findById(id, function (err, order) {
		if (err) callback(err);
		else callback(null, order);
	});
}

function flagAsSent (orderID, callback) {
	byID(orderID, function (err, order) {
		if (err) callback(err);
		else {
			order.reviewSent = true;
			order.save(function (err) {
				if (err) callback(err);
				else callback(null);
			})
		}
	})
}

exports.all = all;
exports.findById = byID;
exports.latest = getLatest;
exports.latestByShop = getLatestByShop;
exports.save = save;
exports.emailInfo = emailInfo;
exports.flagAsSent = flagAsSent;
