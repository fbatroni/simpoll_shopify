var init = function(app, config) {
	app.get('/', function (req, res) {
		var shop, key;
		if (req.session.shop) {
			shop = req.session.shop.name;
			console.log('Shop: ' + shop + ' stored in session.');
			key = req.session.shop.token;
		}

		if (shop && key) {
			res.render('dashboard', {
				title: 'Simpoll - Shop Dashboard',
				shop: req.session.shop
			});
		} else {
			res.render('index', {
				title: 'Simpoll Product Reviews',
				shop: null
			});
		}
	});
}

exports.init = init;