var Watcher = function() {
}

Watcher.prototype.cleanup = function(days) {
	var cut_date = new Date()
	cut_date.setDate(-days)
	console.log("cut date " + cut_date)
	var Item = require("../models/item")
	Item.remove({ "date": {"$lt": cut_date } }, function(err, any) {
		if(err) {
			console.log("Failed to remove old items")
			return
		}
		console.log("result: " + any)
	})
	return
	Item.remove({ "date": {"$lt": cut_date} })
	console.log("Items older that %d days removed. ", days)
	var Feed = require("../models/feed")
	Feed.remove({ "since": {"$lt": cut_date} })
	console.log("Feeds older that %d days removed. ", days)
}

module.exports = new Watcher()
