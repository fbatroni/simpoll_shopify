// Module Dependencies
var FetchOrders = require('./fetch_orders').start,
	Priest 		= require('../helpers/cronjobs')
					.Cron_Priest;

// Fire Away
console.log('Initializing cron jobs');
var job1 = new Priest({
	handler:FetchOrders,
	name:"Fetch Orders",
	desc:"fetch orders from store"
});

job1.start(1);


var job2 = new Priest({
	name:"No Name",
	desc:"do nothing"
});

job2.start(1);
