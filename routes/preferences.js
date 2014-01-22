// Dependencies
var Webhook     = require('../tasks/jobs/create_webhooks'),
	Preferences = require('../model/preferences'),
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
		Preferences.save(preference, shopName, function (err, pref) {
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
				  	else {
				  		Webhook.install(req.session.shop, function (err, data, invalidSession) {
				  			if (err) res.send('Oops. Something went wrong! : '+ err);
				  			else {
				  				if (invalidSession) res.redirect('/login');
				  				else {
				  					console.log(data);
				  					res.redirect('/');
				  				}
				  			}
				  		});

				  	}
				});
			}
		});
	});
}

exports.init = init;
