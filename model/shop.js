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














/*
* Module Dependencies
*/
// var mongoose = require('mongoose'),
// 	Post = mongoose.model('Post');

// function all(callback) {
// 	Post.find()
// 	.sort('-created_at')
// 	.exec(function (err, posts) {
// 		if (err) callback(err);
// 		callback(null, posts);
// 	});
// }
// function byTitle(title, callback) {
// 	Post.find()
// 	.where('title')
// 	.equals(title)
// 	.exec(function (err, posts) {
// 		if (err) callback(err);
// 		callback(null, posts[0]);
// 	});
// }
// function byCategory(category, num, skip, callback) {
// 	Post.find()
// 	.where('categories')
// 	.in([category])
// 	.sort('-created_at')
// 	.skip(skip)
// 	.limit(num)
// 	.exec(function (err, posts) {
// 		if (err) callback(err);
// 		callback(null, posts);
// 	});
// }
// function byMonth(month, callback) {
// 	var fdm = Date.parse(month.toString('yyyy-MM-ddTHH:mm:ss')).moveToFirstDayOfMonth();
// 	var ldm = Date.parse(month.toString('yyyy-MM-ddTHH:mm:ss')).moveToLastDayOfMonth();
// 	Post.find()
// 	.where('created_at').gte(fdm).lte(ldm)
// 	.sort('-created_at')
// 	.exec(function (err, posts) {
// 		if (err) callback(err);
// 		callback(null, {
// 			name: month.toString('MMMM, yyyy').toUpperCase(),
// 			dateObj: new Date(month),
// 			posts: posts
// 		});
// 	});
// }
// function recent(num, skip, callback) {
// 	var skip = skip || 0;
// 	Post.find()
// 	.sort('-created_at')
// 	.skip(skip)
// 	.limit(num)
// 	.exec(function (err, posts) {
// 		if (err) callback(err);
// 		callback(null, posts);
// 	});
// }
// function count() {
// 	var category, callback;
// 	if (arguments.length == 1) {
// 		callback = arguments[0];
// 		Post.count({}, function (err, count) {
// 			if (err) callback(err);
// 			callback(null, count);
// 		});
// 	} else {
// 		category = arguments[0], callback = arguments[1];
// 		Post.where('categories')
// 		.in([category])
// 		.count(function (err, count) {
// 			if (err) callback(err);
// 			callback(null, count);
// 		});
// 	}
// }
// function save(posts, callback) {
// 	posts = (posts instanceof Array) ? posts : [posts];
// 	Post.create(posts, function (err) {
// 		if (err) callback(err);
// 		else {
// 			var saved = Array.prototype.slice.call(arguments, 1);
// 			callback(null, saved);
// 		}
// 	});
// }
// function addComment(post, comment, callback) {
// 	post.comments.push(comment);
// 	post.save(function (err) {
// 		if (err) callback(err);
// 		else callback(null);
// 	});
// }

// exports.all = all;
// exports.byTitle = byTitle;
// exports.count = count;
// exports.recent = recent;
// exports.save = save;
// exports.addComment = addComment;
// exports.byCategory = byCategory;
// exports.byMonth = byMonth;