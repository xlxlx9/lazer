// app/models/item.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ItemSchema = new Schema({
       title: String
	 , content: String
	 , summary: String
	 , author: { type: String, default: null }
	 , original: { type: String, default: null }
	 , cover: String
	 , link: String
	 , icon: String
	 , date: { type: Date, default: Date.now }
	 , video: String
	 , source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' }
});

module.exports = mongoose.model('Item', ItemSchema);

