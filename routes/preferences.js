// Dependencies
var Preferences = require('../model/preferences'),
	Shop 		= require('../model/shop'),
	step		= require('async');

var init = function(app, config) {
	// New Merchant - Show defaulted preferences form
	app.get('/preferences/new', function (req, res) {
		res.render('preferences', {
			title: 'Simpoll Reviews - Set your preferences',
			shop: req.session.shop,
			preferences: {
				leadTime: 14,
				messageSubject: 'Review your recent purchase at {shop}',
				messageGreeting: 'Hello {customer},',
				messageBody: 'Thank for your recent purchase on our store. We really appreciate it if you took a moment to tell us how you feel about the items.',
				messageSignature: 'We really appreciate your feedback and hope to see you again soon.<br />Thank you from {Shop name}',
				showAsSentFrom: 'customerlove@shop.com',
				publishToShop: true,
				notifyByMail: true
			}
		});
	});

	// New Merchant - Form submitted, save preferences
	app.post('/preferences/new', function (req, res) {
		// Grab preferences
		var preference 	= req.body,
			shopName 	= req.session.shop.name;

		// Convert publish and notify fields to booleans
		preference.publishToShop = (preference.publishToShop == 'yes') ?
									true : false;
		preference.notifyByMail = (preference.notifyByMail == 'yes') ?
									true : false;

		// Save the preferences
		Preferences.save(preference, function (err, pref) {
			if (err) res.send('an error occurred');
			else {
				step.waterfall([
				    function(callback){
				    	Shop.findByName(shopName, function (err, shop) {
				    		if (err) callback(err);
				    		else callback(null, shop);
				    	});
				    },
				    function(shop, callback){
				        Shop.savePreferences(shop, pref, function (err) {
							if (err) callback(new Error('Error saving preferences.'));
							else callback(null);
						});
				    }
				], function (err) {
				   	if (err) res.send(err.message);
				  	else res.redirect('/');
				});
			}
		});

		// var shop = {
		// 	name: req.body.shop.replace(".myshopify.com",''),
		// 	password: Pass.hash(req.body.password)
		// }
		// Shop.save(shop, function (err, theShop) {
		// 	if (err) res.send('An error occurred');
		// 	else {
		// 		req.session.shop = {
		// 			name: theShop.name,
		// 			token: null,
		// 			url: null
		// 		};
		// 		res.redirect('/signup/install')
		// 	}
		// });
	});
}

exports.init = init;