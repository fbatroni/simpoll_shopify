/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Order = mongoose.model('Order');

function save(orders, callback) {
	orders = (orders instanceof Array) ? orders : [orders];
	Order.create(orders, function (err) {
		if (err) callback(err);
		else {
			var saved = Array.prototype.slice.call(arguments, 1);
			callback(null, saved);
		}
	});
}

function getLatest(callback) {
	Order.find()
	.sort('-placed_at')
	.limit(1)
	.exec(function (err, orders) {
		if (err) callback(err);
		else if (orders.length) {
			callback(null, orders[0]);
		} else callback(null, null);
	});
}

function getLatestByShop(shopName, callback) {
	Order.find()
	.where('_shop').equals(shopName)
	.sort('-placed_at')
	.limit(1)
	.exec(function (err, orders) {
		if (err) callback(err);
		else if (orders.length) {
			callback(null, orders[0]);
		} else callback(null, null);
	});	
}

exports.latest = getLatest;
exports.latestByShop = getLatestByShop;
exports.save = save;