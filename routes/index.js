var init = function(app) {
	app.get('/', function (req, res) {
		res.send('Welcome');
	});
}

exports.init = init;