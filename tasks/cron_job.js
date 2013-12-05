/**
 *
 * @Name	cronjobs
 * @Author 	S. A.
 * @Date	27 11 14
 * @Purpose	cron stuff
 * @Doc     scroll down to see mini documentation
 **/


// MAKE CRON LIBRARY AVAILABLE
var cronJob = require('cron').CronJob;

// IMPORT logger
var LOGGER = require('../helpers/logger').logger;
var logger = new LOGGER({location:"cron_job.js -> "});
// TURN ON LOGGING
logger.on();


// DEF OF CRON HIGH PRIEST
function High_Priest(_args) {

	//CLASS VARS
	this.name        = _args.name;
	this._args		 = _args;
	this.started     = new Date();
	this.description = _args.desc;

	// CONSTANTS
	this.ONCE 		= '';						// TO RUN ONCE, PASS THE DATE AT WHICH TO RUN
	this.DAILY 		= '00 00 07 * * *';			// RUN AT 7:00AM EVERY DAY
	this.HOURLY 	= '00 00 0-23 * * *';		// RUN EVERY HOUR OF EVERY DAY
	this.WEEKLY 	= '00 00 07 * * 1-6';		// RUN AT 7:00AM EVERY MONDAY - SATURDAY
	this.MONTHLY 	= '00 00 07 27 * *';		// RUN AT 7:00AM ON THE 27th OF EVERY MONTH
	this.BY_MINUTE 	= '00 0-59 * * * *';		// RUN EVERY MINUTE
	this.BY_SECOND  = '0-10 * * * * *';

	this.TIME_ZONE 	= "America/Los_Angeles";	// DEFAULT TIMEZONE
}


High_Priest.prototype.recurring_job = function() {

	/*
	 * Structure of Object _args
	 * _args = {}
	 * Keys ::
	 *	run_at   :-> type[Cron pattern] Provide a pattern which specifies when and how often to run job, you can select from above
	 *	handler  :-> type[Function]     Provide a function which is called at the scheduled time
	 *	start	 :-> type[Boolean]	    Determines whether to start job immediately or later
	 *	timeZone :-> type[String]	    The time zone under which times are given
	 */

	 var _args = this._args || {};
	 logger.log(this.name+ ' Job starting... at '+ this.started);
	 new cronJob({
	 	cronTime : _args.run_at   	 || this.BY_SECOND,
	 	onTick	 : _args.job_handle  || function(){console.log("Default Job Handler! Provide One For Custom Impl!")},
	 	start	 : _args.start       || true,
	 	timeZone : _args.timeZone    || this.TIME_ZONE,
	 });

}; // end method recurring_job


High_Priest.prototype.one_time_job = function(_args) {

	/*
	 * Structure of Object _args
	 * _args = {}
	 * Keys ::
	 *	run_at     :-> type[Cron pattern] Provide a pattern which specifies when and how often to run job, you can select from above
	 *	job_handle :-> type[Function]     Provide a function which is called at the scheduled time
	 *	start	   :-> type[Boolean]	    Determines whether to start job immediately or later
	 *	timeZone   :-> type[String]	    The time zone under which times are given
	 */

	var _args = this._args || {};

	new cronJob(
		_args.date        || new Date(),
		_args.job_handle  || function(){logger.log("Default Job Handler! Provide One For Custom Impl!")},
		_args.start       || true,
		_args.timeZone    || this.TIME_ZONE
	);

}; // end method one_time_job

High_Priest.prototype.start = function(opt) {
	(opt == 1) ? this.recurring_job() : this.one_time_job();
}



// PUBLISH TO WORLD
module.exports.init = High_Priest;


