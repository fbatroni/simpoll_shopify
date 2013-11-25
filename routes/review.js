var Review = require('../model/review');

var init = function(app) {
	app.get('/reviews/new', function (req, res) {
		res.redirect('/static/review.html');
	});
	app.post('/reviews/new', function (req, res) {
		// console.log(req.body.rating);
		Review.save(req.body.review, function (err, saved) {
			if (err) res.send('An error occurred');
			else {
				if (saved) res.send('ok');
			}
		})
	});
	app.get('/reviews/new/save', function (req, res) {
		setTimeout(function () {
			res.redirect('http://opiumshop-2.myshopify.com/products/custom-node-js-tee');
		}, 3000);
	});
}

exports.init = init;