/*
* Module Dependencies
*/
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

exports.save = save;