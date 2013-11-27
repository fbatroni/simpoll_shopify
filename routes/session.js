// Dependencies
var Pass = require('../helpers/password'),
	Shop = require('../model/shop');

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

	// Login
	app.get('/login', function (req, res) {
		res.render('login', {
			title: 'Welcome'
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
			}, {}, function (err, affectedRows) {
				if (err) throw err;
				console.log(affectedRows + 'documents updated');
				res.redirect('/preferences/new');
			});


			// Model.findOneAndUpdate(query, { name: 'jason borne' }, options, callback);
			// config.persistentKeys[config.session.active.store_name]=token;
			// req.session.shopify = {shop:config.session.active.store_name};
		});
	})
};

exports.init = init;