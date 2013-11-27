/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
	Preferences = mongoose.model('Preferences');

function save(preferences, callback) {
	preferences = (preferences instanceof Array) ? preferences : [preferences];
	Preferences.create(preferences, function (err) {
		if (err) callback(err);
		else {
			var saved = Array.prototype.slice.call(arguments, 1);
			callback(null, saved[0]);
		}
	});
}

function findAndUpdate(query, update, options, callback) {
	var options = options || {};
	Preferences.findOneAndUpdate(query, update, options, function (err, numberAffected, raw) {
		if (err) callback(err);
		else {
			callback(null, numberAffected);
		}
	});
}

exports.save = save;
exports.findAndUpdate = findAndUpdate;