// app/modles/trace

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TraceSchema   = new Schema({
	  user: String
	, pool: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
	, size: { type: Number, default: 0 }
});

module.exports = mongoose.model("Trace", TraceSchema);
