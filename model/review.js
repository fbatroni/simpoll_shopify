/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Customer = require('./customer'),
	Review = mongoose.model('Review');

function save(products, callback) {
	// products = (products instanceof Array) ? products : [products];
	// Product.create(products, function (err) {
	// 	if (err) callback(err);
	// 	else {
	// 		var saved = Array.prototype.slice.call(arguments, 1);
	// 		callback(null, saved);
	// 	}
	// });
}

function all(callback) {
	// Product.find()
	// .sort('-created_at')
	// .exec(function (err, products) {
	// 	if (err) callback(err);
	// 	callback(null, products);
	// });
}

function byID(id, callback) {
	Review.findById(id, function (err, review) {
		if (err) callback(err);
		else callback(null, review);
	});
}

function reviewer(review, callback) {
	Customer.findByID(review.reviewer, function (err, reviewer) {
		if (err) callback(err);
		else callback(null, reviewer);
	})
}


exports.save = save;
exports.all = all;
exports.findById = byID;
exports.getReviewer = reviewer;