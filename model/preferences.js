/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Shop = require('./shop'),
	Preferences = mongoose.model('Preferences');

function save(preferences, shopName, callback) {
	Shop.findByName(shopName, function (err, shop) {
		if (err) callback(err);
		else {
			preferences.shop = shop._id;
			preferences = (preferences instanceof Array) ? preferences : [preferences];

			Preferences.create(preferences, function (err) {
				if (err) callback(err);
				else {
					var saved = Array.prototype.slice.call(arguments, 1);
					callback(null, saved[0]);
				}
			});
		}
	});
}

function findAndUpdate(shopID, update, callback) {
	var query = {"shop": shopID};
	var update = update
	var options = {upsert: true};
	Preferences.findOneAndUpdate(query, update, options, function(err, preference) {
	  if (err) callback(err);
	  else callback(null, preference);
	});
}

function byID(id, callback) {
	Preferences.findOne({
		_id: id
	})
	.exec(function (err, preference) {
		if (err) callback(err);
		else callback(null, preference);
	});
}

function byShop(shopID, callback) {
	Preferences.findOne({
		shop: shopID
	})
	.exec(function(err, preference) {
		if (err) callback(err);
		else callback(null, preference);
	});
}

exports.save = save;
exports.findAndUpdate = findAndUpdate;
exports.findByID = byID;
exports.findByShop = byShop;
