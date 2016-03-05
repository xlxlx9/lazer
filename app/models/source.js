// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SourceSchema   = new Schema({
     title: String
	,type: { type: String, default: "rss" }
	,src: String
	,since: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Source', SourceSchema);

