
/**
 *
 * @Name	flingmail
 * @Author 	S. A.
 * @Date	27 11 14
 * @Purpose	mail sender
 * @Doc     scroll down to see mini documentation
 **/


// GET CONFIG FILE AND RETRIEVE MANDRILL API KEY
var config = require ('../config.json');
var apiKey = config.mandrill_api_key;


// MAKE THE MANDRILL MODULE AVAILABLE AND CREATE INSTANCE
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(apiKey);

var frowny = require('../views/email/images/frowny.json').image;
var smiley = require('../views/email/images/smiley.json').image;


var FlingMail = {
	async	: false,

	message : {
		"html" : '<p>Example <b>HTML</b> content</p><br><img src="cid:smile"><br><img src="cid:frown">',
		"text" : "Example text content",
		"subject" : "Email Test Phase 1",
		"from_email" : "Simpoll@reviews.com",
		"from_name" : "Simpoll Shop",
		"to" : [{
			"email" : "elimence@gmail.com",
			"name" : "Samuel Ako",
			"type" : "to"
		}],

		"inline_css": true,

		"images": [{
	        "type": "image/png",
	        "name": "smile",
	        "content": smiley
	    },
	    {
	    	"type": "image/png",
	    	"name": "frown",
	    	"content": frowny
	    }]
	},

	fling : function(_args) {
		console.log("flinging hath began");
		_args = _args || {};

		mandrill_client.messages.send(
			{
				"message" : FlingMail.message,
				"async"	  : FlingMail.async
			},

			_args.success || function(result) { console.log(result) },

			_args.fail    || function(e) { console.log('A mandrill error occurred: '+ e.name+ ' - '+ e.message) }

		);
	},

	init : function(_args) {
		_args = _args || {};

		FlingMail.message.html = _args.html;
		FlingMail.message.text = _args.text;
		FlingMail.message.from_name = _args.from_name;
		FlingMail.message.from_email = _args.from_email;
		FlingMail.message.to.email = _args.to_email;
		FlingMail.message.to.name = _args.to_name;
	}
}

exports.mailer = FlingMail;


