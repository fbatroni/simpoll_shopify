// Module Dependencies
var FetchOrders = require('./fetch_orders').start,
	Priest 		= require('../helpers/cronjobs')
					.Cron_Priest;

// Fire Away
console.log('Initializing cron jobs');
var job1 = Priest.recurrin_job({handler:FetchOrders});
job1.start();

var job2 = Priest.recurrin_job();
job2.start();