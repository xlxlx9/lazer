// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BearSchema   = new Schema({
     title: String
	,type: { type: String, default: "rss" }
	,src: String
	,since: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Source', BearSchema);

