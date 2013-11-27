/**
 *
 * @Name	cronjobs
 * @Author 	Samuel A.
 * @Date	27 11 14
 * @Purpose	cron stuff
 *
 **/

// MAKE CRON LIBRARY AVAILABLE
var cronJob = require('cron').CronJob;


// DEF OF CRON HIGH PRIEST
var High_Priest = {

	// STANDARD CRON PATTERNS
	ONCE		: '',						// TO RUN ONCE, PASS THE DATE AT WHICH TO RUN
	DAILY 		: '00 00 07 * * *',			// RUN AT 7:00AM EVERY DAY
	HOURLY 		: '00 00 0-23 * * *',		// RUN EVERY HOUR OF EVERY DAY
	WEEKLY 		: '00 00 07 * * 1-6',		// RUN AT 7:00AM EVERY MONDAY - SATURDAY
	MONTHLY 	: '00 00 07 27 * *',		// RUN AT 7:00AM ON THE 27th OF EVERY MONTH
	BY_MINUTE 	: '00 0-59 * * * *',		// RUN EVERY MINUTE

	TIME_ZONE   : "America/Los_Angeles",


	/*
	 * Structure of Object _args
	 * _args = {}
	 * Keys ::
	 *	run_at   :-> type[Cron pattern] Provide a pattern which specifies when and how often to run job, you can select from above
	 *	handler  :-> type[Function]     Provide a function which is called at the scheduled time
	 *	start	 :-> type[Boolean]	    Determines whether to start job immediately or later
	 *	timeZone :-> type[String]	    The time zone under which times are given
	 */

	recurrin_job : function(_args) {
		return new cronJob({
			cronTime : _args.run_at   || High_Priest.BY_MINUTE,
			onTick	 : _args.handler  || function(){console.log("Default Job Handler! Provide One For Custom Impl!")},
			start	 : _args.start    || false,
			timeZone : _args.timeZone || High_Priest.TIME_ZONE,
		});

	}, // end recurring_job


	one_time_job : function(_args) {
		return new cronJob(
			_args.date     || new Date(),
			_args.handler  || function(){console.log("Default Job Handler! Provide One For Custom Impl!")},
			_args.start    || true,
			_args.timeZone || High_Priest.TIME_ZONE
		);

	} // end one_time_job

} // end Object High_Priest


exports.Cron_Priest = High_Priest;


		/** HOW TO USE cronjobs.js **/
/*
 * 1. Require the cronjobs.js module as follows;
	  var job = require('./helpers/cronjobs').Cron_Priest.recurrin_job({});
	  Passing an an object to the recurring_job or the one_time_job function
	  You can pass an empty Object to use the defaults which are as follows
	  a) Job is run every minute
	  b) Calls a default handler which prints a message to the console
	  b) Uses the American/Los Angeles time zone
	  c) For a one time job, the job is started immediately, but for a recurring one, start() has to be called on the job to start

 * 2. Finally, call job.start() to begin the job
 	  NB: This is for a recurring job, or a one time job for which you specify start as false

 */



