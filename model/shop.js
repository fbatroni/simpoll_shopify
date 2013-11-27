/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Shop = mongoose.model('Shop');

function save(shops, callback) {
	shops = (shops instanceof Array) ? shops : [shops];
	Shop.create(shops, function (err) {
		if (err) callback(err);
		else {
			var saved = Array.prototype.slice.call(arguments, 1);
			callback(null, saved[0]);
		}
	});
}

function byName(name, callback) {
	Shop.find()
	.where('name')
	.equals(name)
	.exec(function (err, shops) {
		if (err) callback(err);
		callback(null, shops[0]);
	});
}

function addPreference(shop, preference, callback) {
	shop.preferences = preference._id;
	shop.save(function (err) {
		if (err) callback(err);
		else callback(null);
	})
}

function addProducts(shop, products, callback) {
	products.forEach(function (item, index) {
		shop.products.push(item);
	})
	shop.save(function (err) {
		if (err) callback(err);
		else callback(null);
	})
}

function findAndUpdate(query, update, options, callback) {
	var options = options || {};
	Shop.findOneAndUpdate(query, update, options, function (err, numberAffected, raw) {
		if (err) callback(err);
		else {
			callback(null, numberAffected);
		}
	});
}

exports.save = save;
exports.findAndUpdate = findAndUpdate;
exports.findByName = byName;
exports.savePreferences = addPreference;
exports.saveProducts = addProducts;