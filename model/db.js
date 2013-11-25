/*
* Module Dependencies
*/
var mongoose 		= 		require('mongoose'),
	Schema 			= 		mongoose.Schema;

// Connect to the database
var dbUriString	 	= 	process.env.MONGOLAB_URI || process.env.MONGOHQ_URL  || 'mongodb://localhost/simpoll_shopify';
mongoose.connect(dbUriString, function (err, conn) {
	if (err) { 
		console.log ('ERROR connecting to: ' + dbUriString + '. ' + err);
	} else {
		console.log ('Successfully connected to: ' + dbUriString);
	}
});

// Schema & Model Definitions
var ReviewSchema = new Schema({
	type: String,
	rating: String,
	comment: String,
	created_at: {
		type: Date, 
		default: Date.now
	}
});

// Compile Schemas into Models
mongoose.model( 'Review', ReviewSchema );