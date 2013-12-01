/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Shop = mongoose.model('Shop'),
	Preferences = mongoose.model('Preferences');

function all(callback) {
	Shop.find()
	.sort('-created_at')
	.exec(function (err, shops) {
		if (err) callback(err);
		callback(null, shops);
	});
}

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
		else callback(null, shops[0]);
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
		shop.products.push(item._id);
	})
	shop.save(function (err) {
		if (err) callback(err);
		else callback(null);
	})
}

function addOrders(shop, orders, callback) {
	orders.forEach(function (item, index) {
		shop.orders.push(item._id);
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

function daysToWait(shopName, callback) {
	Shop
	.findOne({ name: shopName })
	.exec(function (err, shop) {
		if (err) callback(err);
		else {
			Preferences
			.findOne({_id: shop.preferences})
			.exec(function (err, preferences) {
				if (err) callback(err);
				else callback(null, preferences.leadTime);
			})
		}
	})
}

exports.all = all;
exports.save = save;
exports.findAndUpdate = findAndUpdate;
exports.findByName = byName;
exports.savePreferences = addPreference;
exports.saveProducts = addProducts;
exports.saveOrders = addOrders;
exports.daysToWait = daysToWait;