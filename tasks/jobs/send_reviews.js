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

/** NEED 4 OBJECTS:-> Preferences, Customer, Shop & Orders **/
var cust = {
	name:"",
	email:""
};

var shop = {
	name:""
};

var pref = {
	subject:"",
	signature:"",
	from:"",
	body:""
};

var product = {
	name:""
};

var order = {
	web_version:""
};

var default_to_text = preference.body+ "<br> Your mail client is unable to render this form.
	 please click on the link below to view the web version. <br> "+ preference.signature +
	  " <br> "+ order.web_version;

var fn = jade.compile(require('fs').readFileSync('views/email/review_email.jade'), options);
var htmlOutput = fn({
  order,
  customer,
  preference
});

// console.log(htmlOutput);

function SendReviews() {

	mailer = new Mailer({
		email 		: htmlOutput,
		text  		: default_to_text,
		subject 	: preference.subject,
		from_name 	: shop.name,
		from_email	: preference.from,
		to_name 	: customer.name,
		to_email 	: customer.email
	});

	mailer.dispatch();
}

exports.init = SendReviews;
