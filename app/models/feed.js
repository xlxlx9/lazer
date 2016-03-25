
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SourceSchema   = new Schema({
	 text: String
	,source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' }
	,since: { type: Date, default: null }
});

module.exports = mongoose.model('Feed', SourceSchema);
