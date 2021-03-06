
// IMPORT logger
var LOGGER = require('../helpers/logger').logger;
var logger = new LOGGER({location:"session.js -> "});
// TURN ON LOGGING
logger.on();


// Dependencies
var Pass = require('../helpers/password'),
	Shop = require('../model/shop'),
	Product = require('../model/product'),
	Customer = require('../model/customer'),
	Order = require('../model/order'),
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
					url: null,
					shopID: theShop._id
				};
				res.redirect('/signup/install')
			}
		})
	});

	// Signup - Shop account created, ask them to install our app
	app.get('/signup/install', function (req, res) {
		logger.log(req.session.shop);
		res.render('install', {
			title: 'Simpoll Reviews - Install Our Widget',
			shop: req.session.shop
		});
	});


	// Helpers
	function ISOToDate(ISOString) {
	  return new Date(ISOString);
	}

	// Save the customer object that the customer field in the Order Object will point to
	// This is so we can use the _id value of that object as a ref
	function saveOrderCustomer(order, callback) {
	  Customer.save(order._customer, function (err, customer) {
	    if (err) callback(err);
	    else callback(null, customer);
	  })
	}

	app.post('/new_order', function (req, res) {
		var data = req.body;
		var shopURL = req.headers['x-shopify-shop-domain'];
		logger.log("WEBHOOK HIT");

		// req has no session.shop, create shop object by using vendor name in order object
		shop = Shop.findByUrl(shopURL, function(err, shop) {
		  // Prepare Order Data & Save
	  		Shop.daysToWait(shop.name, function (err, daysToWait) { //Get shops waiting time prior to sending reviews
		    	if (err) throw err;
				else {
				  // Set date for customer to be asked for a review
				  var reviewSendDate = ISOToDate(data.updated_at);
				  reviewSendDate.setDate(reviewSendDate.getDate() + daysToWait);

				  // Get an array of Line Item IDs
				  var shopifyProudctIDS = [];
				  for (var i = 0; i < data.line_items.length; i++) {
				    shopifyProudctIDS.push(data.line_items[i].product_id);
				  }

				  // The customers info
				  var theCustomer = {
				    firstName   : data.customer.first_name,
				    lastName    : data.customer.last_name,
				    email       : data.customer.email,
				    shopifyID   : data.customer.id
				  };

				  // Interim Order Object
				  var order = {
				    id: data.id,
				    name: data.name,
				    totalItems: data.line_items.length,
				    fulfilled_at: data.fulfillment_status,
				    placed_at: data.created_at,
				    review_sceduled_for: reviewSendDate,
				    reviewSent: false,
				    customer: '',
				    products: shopifyProudctIDS,
				    _shop: shop.name
				  };

				  // Fetch customer data for associating with this new order or
				  // Save new customer if no existing customer matches
				  Customer.findByShopifyID(data.customer.id, function (err, customer) {
				    if (err) throw err;
				    if (customer) { // Customer exists, so associate the new order with this customer
				      order.customer = customer._id;
				      // Now save the order
				      Order.save(order, function (err, savedOrder) {
				        if (err) throw err;
				        else logger.log('Saved Order: ', savedOrder);
				      })
				    } else { // No match, Create new customer
				      Customer.save(theCustomer, function (err, newCustomer) {
				      if (err) throw err;
				        order.customer = newCustomer._id;
				        // Now save the order
				        Order.save(order, function (err, savedOrder) {
				          if (err) throw err;
				          else logger.log('Saved Order: ', savedOrder);
				        })
				      });
				    }
				  });
				}
		  });
		});



		res.statusCode = 200;
		res.end();
	});

	// app.post('/reviews/:order_id', function(req, res) {
	// 	console.log('review', req.params.order_id, req.body);
	// 	res.statusCode = 200;
	// 	res.end();
	// });

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
					url: _shop.url,
					shopID: _shop._id
				};
				res.redirect('/');
			}
		});
	});

	// Handle feedback from authentication attempt
	function authenticate(req, res) {
		var shop = req.body.shop;
		if(shop !== undefined && shop !== null) {
		  	logger.log('creating a session for', shop, config.apiKey, config.secret);
			config.session.active = config.nodify.createSession(shop, config.apiKey, config.secret, {
			    scope: {orders: "read", products: "read"},
			    uriForTemporaryToken: "http://"+req.headers.host+"/login/finalize/token",
			    onAskToken: function onToken (err, url) {
			    	logger.log('Heyyyyyyy: ' + url);
			    	res.redirect(url);
			    }
		  	});
		} else {
	  	logger.log('no shop, go login')
			res.redirect('/login');
		}
	}

	function fetchProducts (shop, key, callback) {
		config.session.active = config.nodify.createSession(shop, config.apiKey, config.secret, key);
		if(config.session.active.valid()){
			logger.log('session is valid for <',shop,'>');
			config.session.active.product.all({}, function(err, products){
				if(err) callback(err);
				else {
					logger.log('products:',products);
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
			logger.log('Authenticated on shop <', req.query.shop, '/', config.session.active.store_name, '> with token <', token, '>')

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
				logger.log(shop + ' updated');
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
				 					res.redirect('/preferences');
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
