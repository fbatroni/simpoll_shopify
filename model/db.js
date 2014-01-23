/*
* Module Dependencies
*/

// IMPORT logger
var LOGGER = require('../helpers/logger').logger;
var logger = new LOGGER({location:"db.js -> "});
// TURN ON LOGGING
logger.on();

var mongoose 		= 		require('mongoose'),
	moment 			= 		require('moment'),
	Schema 			= 		mongoose.Schema;

// Connect to the database
var dbUriString = 	process.env.MONGOLAB_URI || process.env.MONGOHQ_URL  || 'mongodb://localhost/simpoll_shopify';

mongoose.connect(dbUriString, function (err, conn) {
	if (err) {
		logger.log ('ERROR connecting to: ' + dbUriString + '. ' + err);
	} else {
		logger.log ('Successfully connected to: ' + dbUriString);
	}
});

// Schema & Model Definitions
// Webhook
var WebhookSchema = new Schema({
	shop: String,
  	topic: String,
	shopifyID: String,
	created_at: Date,
	updated_at: Date,
	address: String
});

// Reviews Tally
var ReviewTallySchema = new Schema({
	reviewer: {
        type: Schema.ObjectId,
        ref: 'CustomerSchema'
    },
    count: {
    	type: Number,
    	default: 0
    }
});

// Reviews
var ReviewSchema = new Schema({
	reviewer: String,
	emotion: Number,
	comment: String,
	shop: String,
	publishToShop: Boolean,
	publishToSocial: Boolean,
	product: Number,
	created_at: {
		type: Date,
		default: Date.now
	}
});

// Product
var ProductSchema = new Schema({
	id: Number,
	name: String,
	imageUrl: String,
	reviews: [ReviewSchema],
	created_at: {
		type: Date,
		default: Date.now
	}
});


// Customer
var CustomerSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	shopifyID: String,
	created_at: {
		type: Date,
		default: Date.now
	}
});

// Order
var OrderSchema = new Schema({
	id: Number,
	name: String,
	customer: {
        type: Schema.ObjectId,
        ref: 'CustomerSchema'
    },
	totalItems: Number,
	products: [Number],
	fulfilled_at: String,
	placed_at: Date,
	review_sceduled_for: Date,
	reviewSent: Boolean,
	_shop: String,
	created_at: {
		type: Date,
		default: Date.now
	}
});

// Preferences
var PreferenceSchema = new Schema({
	leadTime: {
		type: Number,
		default: 14
	},
	messageSubject: {
		type: String,
		default: 'Review your recent purchase at {shop}'
	},
	messageGreeting: {
		type: String,
		default: 'Hello {customer},'
	},
	messageBody: {
		type: String,
		default: 'Thank for your recent purchase on our store. We really appreciate it if you took a moment to tell us how you feel about the items.'
	},
	messageSignature: {
		type: String,
		default: 'We really appreciate your feedback and hope to see you again soon.<br />Thank you from {Shop name}'
	},
	showAsSentFrom: {
		type: String,
		default: 'customerlove@shop.com'
	},
	publishToShop: {
		type: Boolean,
		default: true
	},
	notifyByMail: {
		type: Boolean,
		default: true
	},
	shop: {
		type: Schema.ObjectId,
        ref: 'ShopSchema'
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date
	}
});

// Shop
var ShopSchema = new Schema({
	name: String,
	url: String,
	token: String,
	password: String,
	orders: [{
        type: Schema.ObjectId,
        ref: 'OrderSchema'
    }],
	products: [{
        type: Schema.ObjectId,
        ref: 'ProductSchema'
    }],
	preferences: {
        type: Schema.ObjectId,
        ref: 'PreferenceSchema'
    },
	lastVisited: { type: Date,
		default: Date.now
	},
	created_at: {
		type: Date,
		default: Date.now
	}
});

// Compile Schemas into Models
mongoose.model( 'Preferences', PreferenceSchema );
mongoose.model( 'Shop', ShopSchema );
mongoose.model( 'Product', ProductSchema );
mongoose.model( 'Order', OrderSchema );
mongoose.model( 'Customer', CustomerSchema );
mongoose.model( 'Review', ReviewSchema );
mongoose.model( 'ReviewTally', ReviewTallySchema );
mongoose.model( 'Webhook', WebhookSchema );
