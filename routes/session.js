// Dependencies
var Pass = require('../helpers/password'),
	Shop = require('../model/shop'),
	Product = require('../model/product'),
	step = require('async');

var init = function(app, config) {
	// Signup - Show Signup Form
	app.get('/signup', function (req, res) {
		res.render('signup', {
			title: 'Simpoll Reviews - Create your account',
			shop: null
		});
	});

	// Signup - Form submitted, create shop
	app.post('/signup', function (req, res) {
		var shop = {
			name: req.body.shop.replace(".myshopify.com",''),
			password: Pass.hash(req.body.password)
		}
		Shop.save(shop, function (err, theShop) {
			if (err) res.send('An error occurred');
			else {
				req.session.shop = {
					name: theShop.name,
					token: null,
					url: null
				};
				res.redirect('/signup/install')
			}
		})
	});

	// delte me, just testint email functionality
	app.post('/rev', function (req, res) {
		console.log(req.body);
		res.send(req.body);
	});

	// Signup - Shop account created, ask them to install our app
	app.get('/signup/install', function (req, res) {
		console.log(req.session.shop);
		res.render('install', {
			title: 'Simpoll Reviews - Install Our Widget',
			shop: req.session.shop
		});
	});

	// Signup - Merchant clicked install, start the authentication process
	app.post('/signup/install', authenticate);

	// Login - Show login form
	app.get('/login', function (req, res) {
		var badLogin = (req.query.status == 'badLogin') ? true : false;
		res.render('login', {
			title: 'Simpoll - Login to your account',
			shop: null,
			hasError: badLogin
		});
	});

	// Signup - Form submitted, create shop
	app.post('/login', function (req, res) {
		step.waterfall([
		    function(callback){
		    	Shop.findByName(req.body.shop, function (err, shop) {
		    		if (err) callback(err);
		    		else if (!shop) callback(null, false, null); // Second argument specifies whether the shop exists or not. Third specifies an object representing the shop
		    		else {
		    			var isValidLogin = Pass.validate(shop.password, req.body.password);
		    			if (isValidLogin) callback(null, true, shop);
		    			else callback(null, false, null);
		    		}
		    	});
		    }
		], function (err, validLogin, _shop) {
			if (err || (!validLogin)) {
				res.redirect('/login' + '?status=badLogin');
			}
			else {
				req.session.shop = {
					name: _shop.name,
					token: _shop.token,
					url: _shop.url
				};
				res.redirect('/');
			}
		});
	});

	// Handle feedback from authentication attempt
	function authenticate(req, res) {
		var shop = req.body.shop;
		if(shop !== undefined && shop !== null) {
		  	console.log('creating a session for', shop, config.apiKey, config.secret);
			config.session.active = config.nodify.createSession(shop, config.apiKey, config.secret, {
			    scope: {orders: "read", products: "read"},
			    uriForTemporaryToken: "http://"+req.headers.host+"/login/finalize/token",
			    onAskToken: function onToken (err, url) {
			    	console.log('Heyyyyyyy: ' + url);
			    	res.redirect(url);
			    }
		  	});
		} else {
	  	console.log('no shop, go login')
			res.redirect('/login');
		}
	}

	function fetchProducts (shop, key, callback) {
		config.session.active = config.nodify.createSession(shop, config.apiKey, config.secret, key);
		if(config.session.active.valid()){
			console.log('session is valid for <',shop,'>');
			config.session.active.product.all({}, function(err, products){
				if(err) callback(err);
				else {
					console.log('products:',products);
					callback(null, products);
				}
			});
		}
	}

	// Exchange temporary token for a permanent one
	app.get('/login/finalize/token', function(req, res) {
		if(! req.query.code) {
			return res.redirect("/login?error=Invalid%20connection.%20Please Retry");
		}
		// Request permanent token
		config.session.active.requestPermanentAccessToken(req.query.code, function onPermanentAccessToken(token) {
			console.log('Authenticated on shop <', req.query.shop, '/', config.session.active.store_name, '> with token <', token, '>')

			// Add shop token and url to the session
			req.session.shop.token = token;
			req.session.shop.url = config.session.active.url;

			// Find and update the Shop with its token and url
			var query = {
				name: req.session.shop.name
			};
			Shop.findAndUpdate(query, {
				token: token,
				url: config.session.active.url
			}, {}, function (err, shop) {
				if (err) throw err;
				console.log(shop + ' updated');
				fetchProducts(req.session.shop.name, req.session.shop.token,
				 function (err, products) {
				 	var _products = [];
				 	products.forEach(function (item, index) {
				 		_products.push({
				 			id: item.id,
				 			name: item.title,
				 			imageUrl: item.image.src
				 		});
				 	});

				 	Product.save(_products, function (err, savedProducts) {
				 		if (err) res.send('Error saving products');
				 		else {
				 			Shop.saveProducts(shop, savedProducts, function (err) {
				 				if (err) res.send('Error updating Shop with products');
				 				else {
				 					res.redirect('/preferences/new');
				 				}
				 			});
				 		}
				 	})
				 });
			});
		});
	});

	// Logout
	app.get('/logout', function (req, res) {
		req.session.shop = null;
		res.redirect('/');
	});
};

exports.init = init;
