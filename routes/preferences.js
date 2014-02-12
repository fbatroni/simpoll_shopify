// Dependencies
var Webhook     = require('../tasks/jobs/create_webhooks'),
	Preferences = require('../model/preferences'),
	Shop 		= require('../model/shop'),
	SavedHooks	= require('../model/webhook'),
	step		= require('async');

var init = function(app, config) {
	// New Merchant - Show defaulted preferences form
	app.get('/preferences', function (req, res) {

		if (req.session.shop) {
			var shopID   = req.session.shop.shopID,
				shopName = req.session.shop.name;

			Preferences.findByShop(shopID, function(err, preference) {
				if (err) throw err;
				else {
					if (!preference) {
						Preferences.save({}, shopName, function(err, saved_preference) {

							step.waterfall([
							    function(callback){
							    	Shop.findByName(shopName, function (err, shop) {
							    		if (err) callback(err);
							    		else callback(null, shop);
							    	});
							    },
							    function(shop, callback){
							        Shop.savePreferences(shop, saved_preference, function (err) {
										if (err) callback(new Error('Error saving preferences.'));
										else callback(null);
									});
							    }
							], function (err) {
							   	if (err) console.log("error when saving new pref to shop: ", err);
							});

							res.render('preferences', {
								title: 'Simpoll Reviews - Set your preferences',
								shop: req.session.shop,
								preferences: saved_preference
							});
						});
					} else {
						res.render('preferences', {
							title: 'Simpoll Reviews - Set your preferences',
							shop: req.session.shop,
							preferences: preference
						});
					}

				}
			});
		} else {
			res.send('you are not logged in <br> click <a href="/login">here</a> to login');
		}

	});

	// New Merchant - Form submitted, save preferences
	app.post('/preferences', function (req, res) {
		// Grab preferences
		if (req.session.shop) {
			var preference 	= req.body,
				shopName 	= req.session.shop.name,
				shopID 		= req.session.shop.shopID;
		} else {
			res.send('Session expired! Please <a href="/login">login</a> to continue');
			return;
		}

		// Convert publish and notify fields to booleans
		preference.publishToShop = (preference.publishToShop == 'yes') ?
									true : false;
		preference.notifyByMail = (preference.notifyByMail == 'yes') ?
									true : false;

		Preferences.findAndUpdate(shopID, preference, function(err, saved_preference) {
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
				        Shop.savePreferences(shop, saved_preference, function (err) {
							if (err) callback(new Error('Error saving preferences.'));
							else callback(null);
						});
				    }
				], function (err) {
				   	if (err) res.send(err.message);
				  	else {
				  		Webhook.install(req.session.shop, function (err, data, invalidSession) {
				  			if (err) {
				  				// console.log("Something's not right! Probably a webhook exists already for the stated topic");
				  				// res.send('click <a href="/">here</a> to go home');
				  				res.redirect('/');
							}
				  			else {
				  				if (invalidSession) res.redirect('/login');
				  				else {
				  					// all things went well, shopify responded with details of created webhook + id
				  					SavedHooks.save(data, function(err, data) {
				  						if (err) throw err;
				  						else console.log("webhook saved: ", {
				  							shop: req.session.shop.name,
				  							shopifyID: data.id,
				  							topic: data.topic,
				  							created_at: data.created_at,
				  							updated_at: data.updated_at,
				  							address: data.address
				  						});
				  					})
				  					console.log(data);
				  					res.redirect('/');
				  				}
				  			}
				  		});

				  	}
				});
			} // end else
		});

	}); // end app.post
}

exports.init = init;
