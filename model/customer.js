/*
* Module Dependencies
*/

// IMPORT logger
var LOGGER = require('../../helpers/logger').logger;
var logger = new LOGGER({location:"fetch_orders.js -> "});
// TURN ON LOGGING
logger.on();

var mongoose = require('mongoose'),
	Customer = mongoose.model('Customer');

function save(customers, callback) {
	customers = (customers instanceof Array) ? customers : [customers];
	Customer.create(customers, function (err) {
		if (err) callback(err);
		else {
			var saved = Array.prototype.slice.call(arguments, 1);
			callback(null, saved[0]);
		}
	});
}

function byID(id, callback) {
	Customer.findOne({
		_id: id
	})
	.exec(function (err, customer) {
		if (err) callback(err);
		else callback(null, customer);
	});
}

exports.save = save;
exports.findByID = byID;
