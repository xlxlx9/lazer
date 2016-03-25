// extract.js

var mongoose   = require('mongoose');

var nconf = require("nconf");
nconf.argv().env();
var cfg_name = nconf.get("conf") || "conf.json";
nconf.file({ "file": cfg_name });
nconf.defaults({
	  "database": "mongodb://blazer:n0t_a_Doctor@127.0.0.1:27017/blazer"
});


mongoose.connect(nconf.get("database"));
mongoose.connection.on('error', function (err) {
	console.log("mongoose connection err!" + err);
});

var chalk = require("chalk");

var Source = require("../models/source");
var cnt = 0;
var save_one = function(err, d) {
	if(err) {
		console.error("Failed to save sourc: %s", d.title);
	}
	cnt --;
	if(0 < cnt) return;
	console.log(chalk.green("All sources processed. "));
	process.exit(0);
};

Source.find({}, function(err, docs) {
	if(err) {
		console.error("Failed to get sources");
		return;
	}
	cnt = docs.length;
	for(var i in docs) {
		var src = docs[i];
		src.latest = null;
		src.stamp = null;
		src.save(save_one);
	}
});
