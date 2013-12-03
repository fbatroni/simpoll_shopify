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

function all(callback) {
	Product.find()
	.sort('-created_at')
	.exec(function (err, products) {
		if (err) callback(err);
		callback(null, products);
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

function byID(id, callback) {
	Product.findById(id, function (err, product) {
		if (err) callback(err);
		else callback(null, product);
	});
}

function stat(sid, reviewType, callback) {
	bySID(sid, function (err, product) {
		if (err) callback(err);
		else {
			var emotion = (reviewType == 'positives') ?
							1 : 0;
			Product.count({ emotion: emotion }, function (err, count) {
			  if (err) callback(err);
			  else callback(null, count);
			});
		}
	});
}

exports.save = save;
exports.all = all;
exports.findByName = byName;
exports.findById = byID;
exports.findByShopifyID = bySID;
exports.stats = stat;