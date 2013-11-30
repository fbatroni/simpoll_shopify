/**
 *
 * @Name	send_reviews
 * @Author 	S. A.
 * @Date	30 11 14
 * @Purpose	dispatch reviews
 * @Doc     scroll down to see mini documentation
 **/

// LOAD MAILER
var Mailer = require('../../helpers/flingmail').init;

// LOAD TEMPLATE
var review_template = require('../../views/email/em.json').jade;


// LOAD DB MODULES
var	Shop     = require('../../model/shop'),
	Order    = require('../../model/order'),
	Customer = require('../../model/customer');

// LOAD JADE
var jade = require('jade');


var options= {
	pretty : true
};

var fn = jade.compile(require('fs').readFileSync('views/email/review_email.jade'), options);
var htmlOutput = fn({
  customer: {
    name: 'Alonzo Church'
  }
});

console.log(htmlOutput);

function SendReviews() {

	mailer = new Mailer({
		email : htmlOutput,
		text  : 'no text version yet',
		subject : 'What\'s up bro',
		from_name : 'Samuel of Shopify',
		from_email : 'elimence@gmail.com',
		to_name : 'Forbes Lind',
		to_email : 'samuel.ako@meltwater.org'
	});
	mailer.dispatch();
}

exports.init = SendReviews;
