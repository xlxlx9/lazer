var Picker = function() {
};

Picker.prototype.pick = function(docs, seconds) {
	var item_list = [];
	var explored = {};
	for(var i = 0; i < docs.length; i++) {
		var ch = docs[i];
		for(var j = 0; j < ch.sources.length; j++) {
			var srcj = ch.sources[j];
			console.log("source key: %s", j);
			if(null == srcj) continue;
			if(srcj._id in explored) continue;
			explored[srcj._id] = 1;
			console.info("adding item from source: %s - %s", srcj.title, srcj._id);
			for(var k = 0; k < srcj.recent.length; k++) {
				var itemk = srcj.recent[k];
				itemk.icon = srcj.icon; // TODO: adding icon, but not working, because Mongo Model does not include icon. 
				item_list.push(itemk);
			}
		}
	}
	item_list.sort(function(a,b) { return a.date > b.date; });
	var max = Math.ceil(seconds / 160);
	if(item_list.length > max) item_list.splice(max - 1, item_list.length - max);
	return item_list;
};

module.exports = new Picker();

