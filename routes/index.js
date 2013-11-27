var init = function(app, config) {
	app.get('/', function (req, res) {
		var shop, key;
		if (req.session.shop) {
			shop = req.session.shop.name;
			console.log('Shop: ' + shop + ' stored in session.');
			key = req.session.shop.token;
		}

		// if (req.query.shop) {
		// 	shop = req.query.shop.replace(".myshopify.com", '');
		// 	console.log('Shop given by query:', shop);
		// 	key = config.persistentKeys[shop];
		// }

		if (shop && key) {
			res.send('Will show dashboard');
		} else {
			res.render('index', {
				title: 'Simpoll Product Reviews',
				shop: null
			});
		}
	});
}

exports.init = init;