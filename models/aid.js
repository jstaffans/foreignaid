var databaseUrl =  "mongodb://johannes:johannes4Aid@ds039457.mongolab.com:39457/foreign_aid";
var collections = ["countries", "events"];
var db = require("mongojs").connect(databaseUrl, collections);

var map = function() {
	emit(this.Country, {
	    "Paid": this.Paid,
	    "count": 1
	});
};

var reduce = function(key, values) {
	var sum = 0;
	var rows = 0;

    values.forEach(function(doc) {
    	sum += doc.Paid;
	   	rows += doc.count;
    });

    return {"Paid": sum, "count": rows};
};

module.exports.getAidForYear = function(year, resultsCallback) {
	var year = parseInt(year);
	db.events.mapReduce(map, reduce, 
		{
			out : {"inline": 1}, 
			query: {"Year": year, "Country": {$nin: [998, 798, 862]}}
		}, 
		function(err, result) {
			// normalize data
			var max = 0;

			result.forEach(function(result) {
				if (result.value.Paid > max) {
					max = result.value.Paid;
				}
			});

			result.forEach(function(result) {
				result.value.Paid = result.value.Paid / max;
			});

			resultsCallback(err, result);
		});
}