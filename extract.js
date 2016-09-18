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

var rss = require("./app/worker/rss");
var watcher = require("./app/worker/watcher");
var chalk = require("chalk");

var gl = { rss: {} };

if(nconf.get("hurry")) {
	var tmt = 5;
	console.log(chalk.blue("Start scraping in %d seconds! "), tmt);
	setTimeout(function() {
		rss.revisit(gl.rss);
	}, tmt * 1000);
}

var minutes = 10;
setInterval(function() {
	rss.revisit(gl.rss);
}, minutes * 60 * 1000);

watcher.cleanup(7)
setInterval(function() {
	watcher.cleanup(7)
}, 24 * 60 * 60 * 1000)

