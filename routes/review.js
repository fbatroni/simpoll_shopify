// Dependencies
var Product = require('../model/product'),
	Review = require('../model/review'),
	step		= require('async');

var init = function(app, config) {
	// Helpers
	function getStat(product, callback) {
		var totalReviews = product.reviews.length,
			statData	 = {};
		if (!totalReviews) {
			callback(null, {
				_id: product._id,
				id: product.id,
				name: product.name,
				totalReviews: 0,
				positives: 0,
				negatives: 0,
				favorability: 0
			});
		} else {
			Product.stats(product.id, 1, function (err, positives) {
				if (err) callback(err);
				else {
					callback(null, {
						_id: product._id,
						id: product.id,
						name: product.name,
						totalReviews: totalReviews,
						positives: positives,
						negatives: totalReviews - positives,
						favorability: positives / totalReviews
					});
				}
			});
		}
	}

	function getProductStats(products, callback) {
		step.map(products, getStat, function (err, stats) {
			if (err) callback(err);
			else callback(null, stats);
		});
	}

	function getInfo(review, callback) {
		Review.getReviewer(review, function (err, reviewer) {
			if (err) callback(err);
			else {
				review.reviewer = reviewer;
				callback(null, review);
			}
		})
	}

	function getReviewsInfo(reviews, callback) {
		step.map(reviews, getInfo, function (err, reviewsInfo) {
			if (err) callback(err);
			else callback(null, reviewsInfo);
		});
	}

	// Get reviews summary by product
	app.get('/reviews', function (req, res) {
		if (req.session.shop) {
			step.waterfall([
			    function(callback){
			    	Product.all(function (err, products) {
	    				if (err) res.send('Error fetching products');
	    				else {
	    					callback(null, products);
	    				}
	    			});
			    },
			    function(products, callback){
			    	getProductStats(products, function (err, stats) {
			    		if (err) callback(err);
			    		else callback(null, stats);
			    	});
			    }
			], function (err, productStats) {
				if (err) res.send('Error fetching products');
				else {
					res.render('reviewSummaryByProducts', {
						title: 'Simpoll - Reviews Summary',
						shop: req.session.shop,
						products: productStats
					});
				}
			});	
		} else {
			res.redirect('/');
		}
	});

	// Fetch reviews for a particular product
	app.get('/reviews/:id', function (req, res) {
		if (req.session.shop) {
			step.waterfall([
			    function(callback){
			    	Product.findById(req.params.id, function (err, product) {
			    		if (err) callback(err);
			    		else {
			    			callback(null, product);
			    		}
			    	});
			    },
			    function(product, callback){
			    	getReviewsInfo(product.reviews, function (err, reviewsInfo) {
			    		if (err) callback(err);
			    		else {
			    			product.reviews = reviewsInfo;
			    			console.log(product);
			    			callback(null, product);
			    		}
			    	});
			    }
			], function (err, product) {
				if (err) res.send('Error fetching reviews');
				else {
					res.render('reviewsByProduct', {
						title: 'Simpoll - Reviews by product',
						shop: req.session.shop,
						product: product
					});
				}
			});	

			// Product.findById(req.params.id, function (err, product) {
			// 	if (err) res.send('Error fetching reviews');
			// 	else {
			// 		res.render('reviewsByProduct', {
			// 			title: 'Simpoll - Reviews by product',
			// 			shop: req.session.shop,
			// 			product: product
			// 		});
			// 	}
			// });
		} else {
			res.redirect('/');
		}

	});
}

exports.init = init;