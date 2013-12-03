
/**
 *
 * @Name	Mailer
 * @Author 	S. A.
 * @Date	27 11 14
 * @Purpose	mail sender
 * @Doc     scroll down to see mini documentation
 **/



// GET CONFIG FILE AND RETRIEVE MANDRILL API KEY
var config = require ('../config.json');
var apiKey = config.mandrill_api_key;

// MAKE THE MANDRILL MODULE AVAILABLE AND CREATE INSTANCE
var mandrill        = require('mandrill-api/mandrill');


// IMPORT logger
var LOGGER = require('./logger').logger;
var logger = new LOGGER();
// TURN ON LOGGING
logger.on();


function Mailer(_args) {

	// INIT MANDRIL CLIENT OBJECT
	this.m_client = new mandrill.Mandrill(apiKey);

	// ASSIGN CALLBACKS
	this.usr_def_fail = _args.fail;
	this.usr_def_succ = _args.success;

	// LOAD IMAGES TO INCLUDE IN MESSAGE BODY
	this.frowny_image = require('../views/email/images/frowny.json').image;
	this.smiley_image = require('../views/email/images/smiley.json').image;
	this.simpol_brand = require('../views/email/images/simpol.json').image;

	// INIT EMAIL MESSAGE PARAMS
	this.async = false;
	this.message = {
		"html" 			: _args.email,
		"text" 			: _args.text,
		"subject" 		: _args.subject,
		"from_email"	: _args.from_email,
		"from_name"		: _args.from_name,
		"to"			: [{
			"email"	: _args.to_email,
			"name"	: _args.to_name,
			"type"	: "to"
		}],

		"inline_css"	: true,

		"images"		: [{
			"type"    : "image/png",
			"name"	  : "SMILEY_IMAGE",
			"content" : this.smiley_image
		},
		{
			"type"    : "image/png",
			"name"	  : "FROWNY_IMAGE",
			"content" : this.frowny_image
		},
		{
			"type"    : "image/png",
			"name"	  : "SIMPOL_BRAND",
			"content" : this.simpol_brand
		}]

	};
}// END CLASS Mailer


// DEFAULT FAIL FUNCTION THAT IS USED WHEN NONE IS PROVIDED
Mailer.prototype.fail = function(e) {
	logger.log('A mandrill error occurred: '+ e.name+ ' - '+ e.message);
	logger.log('if you are seeing this message, know that i\'m not responsible');
};// END METHOD fail


// DEFAULT SUCCESS FUNCTION THAT IS USED WHEN NONE IS PROVIDED
Mailer.prototype.success = function(result) {
	var res = result[0];

	if(res.status == 'sent') {
		logger.log("email successfully sent to "+ res.email);
	} else {
		logger.log('email to '+ res.email+ ' has failed permanently');
		logger.log('reason: '+ res.reject_reason);
	}
};// END METHOD success


// CALL THIS METHOD TO SEND MESSAGE
Mailer.prototype.dispatch = function() {
	logger.log("...Sending email to "+ this.message.to[0].name+ " from "+ this.message.from_name);

	this.m_client.messages.send(
		{
			"message" : this.message,
			"async"	  : this.async
		},

		this.usr_def_succ || this.success,
		this.usr_def_fail || this.fail
	);
};// END METHOD dispatch


// PUBLISH TO THE UNIVERSE :)
module.exports.init = Mailer


