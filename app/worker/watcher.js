var Watcher = function() {
}

Watcher.prototype.cleanup = function(days) {
	var cut_date = new Date()
	cut_date.setDate(cut_date.getDate() - days)
	console.log("cut date " + cut_date)
	var Item = require("../models/item")
	Item.remove({ "date": {"$lt": cut_date } }, function(err, any) {
		if(err) {
			console.log("Failed to remove old items")
			return
		}
		console.log("Remove item result: " + any)
	})
	var Feed = require("../models/feed")
	Feed.remove({ "since": {"$lt": cut_date} }, function(err, any) {
		if(err) {
			console.log("Failed to remove old feeds")
			return
		}
		console.log("Remove feed result: " + any)
	})
}

module.exports = new Watcher()
