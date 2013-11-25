var init = function(app) {
	app.get('/', function (req, res) {
		res.redirect('/static/survey.html');
	});
	app.get('/demo', function (req, res) {
		res.redirect('/static/demo.html');
	});
}

exports.init = init;