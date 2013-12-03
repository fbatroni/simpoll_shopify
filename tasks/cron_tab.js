/**
 *
 * @Name	cron_tab
 * @Author 	S. A.
 * @Date	30 11 14
 * @Purpose	for starting cron jobs
 * @Doc     scroll down to see mini documentation
 **/


// Module Dependencies
var Priest 		= require('./cron_job').init;

// IMPORT logger
var LOGGER = require('../helpers/logger').logger;
var logger = new LOGGER();
// TURN ON LOGGING
logger.on();



// LOAD JOBS
var FetchOrders = require('./jobs/fetch_orders').init,
	SendReviews	= require('./jobs/send_reviews').init,
	UpdateOrder = require('./jobs/update_order').init;



// INIT JOBS
logger.log('Initializing cron jobs');

var FetchOrdersJob = new Priest({
	job_handle : FetchOrders,
	name	   : "Fetch Orders",
	desc 	   : "fetch orders from store"
});

var SendReviewsJob = new Priest({
	job_handle : SendReviews,
	name	   : "Send Reviews",
	desc       : "Send Emails Requesting For Reviews"
});

var UpdateOrderJob = new Priest({
	job_handle : UpdateOrder,
	name	   : "Update Orders",
	desc       : "update delivery status of unfulfilled orders"
});


// START JOBS
FetchOrdersJob.start(1);
SendReviewsJob.start(1);
// UpdateOrderJob.start(1);
