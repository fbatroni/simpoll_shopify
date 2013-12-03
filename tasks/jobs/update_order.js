
var	nodify   = require('nodify-shopify'),
	Order    = require('../../model/order');

// IMPORT logger
var LOGGER = require('../../helpers/logger').logger;
var logger = new LOGGER();

// TURN ON LOGGING
logger.on();

var	get_orders         = require('../../model/order').all,
	flag_order_as_sent = require('../../model/order').flagAsSent;



var Olympus = {

	crawl_orders	: function (callback) {

    	get_orders(function (err, orders) {
			if (err) callback(err);
			else callback(null, orders);
		});
	},

	filter_orders	: function (orders, callback) {

		function filter (order, callback) {

		    if (toDay >= sched && !order.reviewSent) callback(true);
		    else				callback(false);
		};

		step.filter(orders, filter, function(_orders) {
			callback(null, _orders);
		});
	},

	check_for_changes : function (orders, callback) {



		step.map(orders, get_order_email_info, function (err, orders_email_info) {
			if (err) callback(err);
			else {
				step.map(orders_email_info, generateMessageHtml, function (err, emailObjects) {
					if (err) callback(err);
					else {
						callback(null, emailObjects);
					}
				});
			};
		});
	},

	update		: function (err, emailObjects) {

		if (err) throw err;
		else {

			emailObjects.forEach(function (emailObject, index) {
				mailer = new Mailer({
					email : emailObject.html,
					text  : emailObject.email_info.emailBody,
					subject : emailObject.email_info.emailSubject,
					from_email : emailObject.email_info.sentFrom,
					from_name : emailObject.email_info.shop,
					to_email : emailObject.email_info.customer.email,
					to_name : emailObject.email_info.customer.firstName,
					success : function (result) {
						flag_order_as_sent(emailObject.email_info.orderID, function (err) {
							if (err) throw err;
							logger.log(emailObject.email_info.orderID + 'updated as sent');
						})
					}
				});

				mailer.dispatch()
			});

		};

	},

};


function UpdateOrders() {
	logger.log("starting outside waterfall");
	require('async').waterfall([

		Everest.crawl_orders,
		Everest.filter_orders,
		Everest.check_for_changes,

	], Everest.update);
}

exports.init = SendReviews;

