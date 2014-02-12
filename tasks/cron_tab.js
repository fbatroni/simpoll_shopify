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
var logger = new LOGGER({location:"cron_tab.js -> "});

// TURN ON LOGGING
logger.on();



// LOAD JOBS
var SendReviews	= require('./jobs/send_reviews').init;

// INIT JOBS
logger.log('Initializing cron jobs');

var SendReviewsJob = new Priest({
	job_handle : SendReviews,
	name	   : "Send Reviews",
	desc       : "Send Emails Requesting For Reviews"
});


// START JOBS
SendReviewsJob.start(1);
