/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Product = mongoose.model('Product');

function save(products, callback) {
	products = (products instanceof Array) ? products : [products];
	Product.create(products, function (err) {
		if (err) callback(err);
		else {
			var saved = Array.prototype.slice.call(arguments, 1);
			callback(null, saved);
		}
	});
}

function byName(name, callback) {
	Product.find()
	.where('name')
	.equals(name)
	.exec(function (err, products) {
		if (err) callback(err);
		callback(null, products[0]);
	});
}

function bySID(sid, callback) {
	Product.find()
	.where('id')
	.equals(sid)
	.exec(function (err, products) {
		if (err) callback(err);
		callback(null, products[0]);
	});
}

exports.save = save;
exports.findByName = byName;
exports.findByShopifyID = bySID;