// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SourceSchema   = new Schema({
     title: String
	,type: { type: String, default: "rss" }
	,src: String
	,recent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
	,since: { type: Date, default: Date.now }
	,icon: { type: String, default: ""}
	,latest: { type: String, default: null }
	,stamp: { type: Date, default: null }
	,cover: { type: String, default: null }
});

module.exports = mongoose.model('Source', SourceSchema);

