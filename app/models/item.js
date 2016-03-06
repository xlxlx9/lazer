// app/models/item.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ItemSchema = new Schema({
       title: String
	 , content: String
	 , cover: String
	 , link: String
	 , date: { type: Date, default: Date.now }
	 , video: String
	 , source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' }
});

module.exports = mongoose.model('Item', ItemSchema);
