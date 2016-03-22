
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SourceSchema   = new Schema({
	 text: String
	,source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' }
	,since: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feed', SourceSchema);
