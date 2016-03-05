// app/models/channel.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChannelSchema = new Schema({
     title: String
	,sources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Source' }]
	,rank: { type: Number, default: 100 }
});

module.exports = mongoose.model('Channel', ChannelSchema);

