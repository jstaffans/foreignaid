var model = require('../models/aid.js');

module.exports = function(app) {
	app.get('/aid/:year', function(req, res) {
		model.getAidForYear(req.params.year, function(err, result) {
			res.send(result);
		});
		
	});
}

