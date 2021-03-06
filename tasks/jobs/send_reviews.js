/**
 *
 * @Name	send_reviews
 * @Author 	S. A.
 * @Date	30 11 14
 * @Purpose	dispatch reviews
 * @Doc     scroll down to see mini documentation
 **/

// LOAD MAILER & ASYNC
var Mailer = require('../../helpers/flingmail').init,
	step   = require('async');

// LOAD DB MODULE INTERFACES
var	get_orders         = require('../../model/order').all,
	get_email_info     = require('../../model/order').emailInfo,
	flag_order_as_sent = require('../../model/order').flagAsSent;

// LOAD JADE
var jade = require('jade');

// IMPORT logger
var LOGGER = require('../../helpers/logger').logger;
var logger = new LOGGER({location:"send_reviews.js -> "});

// TURN ON LOGGING
logger.on();



// god object
var Everest = {

	crawl_orders	: function (callback) {
		logger.log('crawling orders');

    	get_orders(function (err, orders) {
			if (err) callback(err);
			else callback(null, orders);
		});
	},

	filter_orders	: function (orders, callback) {
		var today_fullDate   = new Date ();

		function filter (order, callback) {
			var schedule_date_full   = new Date ( order.review_sceduled_for.toString() ),

			    toDay = new Date ( today_fullDate.getFullYear(), today_fullDate.getMonth(), today_fullDate.getDate() ),
			    sched = new Date ( schedule_date_full.getFullYear(), schedule_date_full.getMonth(), schedule_date_full.getDate() );

			// if (toDay >= sched && !order.reviewSent && order.fulfillment_status) callback(true);
		    if ( toDay >= sched && !order.reviewSent ) callback(true);
		    else 	callback(false);
		};

		step.filter(orders, filter, function(_orders) {
			callback(null, _orders);
		});
	},

	cook_email		: function (orders, callback) {

		function get_order_email_info(order, callback) {
			get_email_info(order, function (err, email_info) {
				callback(null, email_info);
			});
		};

		function generateMessageHtml(order_email_info, callback) {
			var fn = jade.compile( require('fs').readFileSync('views/email/review_email.jade'), {pretty: true} );
			logger.log("check for bug : ", order_email_info);
			var htmlOutput = fn({
				orderInfo: order_email_info
			});
			callback(null, {
				html: htmlOutput,
				email_info: order_email_info
			});
		}

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

	dispatch		: function (err, emailObjects) {

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


function SendReviews() {

	require('async').waterfall([

		Everest.crawl_orders,
		Everest.filter_orders,
		Everest.cook_email

	], Everest.dispatch);

}

exports.init = SendReviews;
