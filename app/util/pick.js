var Picker = function() {
};

var default_cover = "http://www.cc.gatech.edu/~lxu315/lzdef/cover.png";
var default_ico = "http://www.cc.gatech.edu/~lxu315/lzdef/favico.png";

Picker.prototype.pick = function(docs, seconds, utrace) {
	var item_list = [];
	var explored = {};
	var tmap = {};
	var max = Math.ceil(seconds / 160);
	var cnt = 0;
	for(var i = 0; i < docs.length; i++) {
		var ch = docs[i];
		for(var j = 0; j < ch.sources.length; j++) {
			var srcj = ch.sources[j];
			//console.log("source key: %s", j);
			if(null == srcj) continue;
			if(srcj._id in explored) continue;
			explored[srcj._id] = 1;
			cnt += srcj.recent.length;
		}
	}
	if(utrace.pool.length >= cnt) {
		//console.log("free %d old items to show", 2 * max);
		utrace.pool.splice(0, max * 2);
	}
	for(var i = 0; i < utrace.pool.length; i++) {
		tmap[utrace.pool[i]] = 0;
	}
	explored = {}; // clear
	for(var i = 0; i < docs.length; i++) {
		var ch = docs[i];
		for(var j = 0; j < ch.sources.length; j++) {
			var srcj = ch.sources[j];
			//console.log("source key: %s", j);
			if(null == srcj) continue;
			if(srcj._id in explored) continue;
			explored[srcj._id] = 1;
			//console.info("adding item from source: %s - %s", srcj.title, srcj._id);
			for(var k = 0; k < srcj.recent.length; k++) {
				var itemk = srcj.recent[k];
				if(tmap.hasOwnProperty(itemk._id)) continue; // this user has seen this before
				itemk.icon = srcj.icon; 
				if(null == itemk.icon || "" == itemk.icon) {
					itemk.icon = default_ico;
				}
				if(null == itemk.cover || "" == itemk.cover) {
					itemk.cover = srcj.cover;
				}
				if(null == itemk.cover || "" == itemk.cover) {
					itemk.cover = default_cover;
				}
				if(null == itemk.author || "" == itemk.author) {
					itemk.author = srcj.title;
				}
				var ecnt = 75;
				if(null != itemk.content && ecnt< itemk.content.length) {
					var ft = itemk.content;
					var ends = [".", "!", "?"];
					for(var ii = 0; ii < ends.length; ii++) {
						var idx_end = ft.indexOf(ends[ii], ecnt);
						if(-1 == idx_end) continue;
						//console.log("Sentence end found @%d", idx_end);
						if(' ' == ft[idx_end + 1]) idx_end ++;
						itemk.summary = ft.substring(0, idx_end + 1);
						break;
					}
					if(null == itemk.summary) {
						console.warn("Empty summary for %s, fallback to entire content", itemk.title);
						itemk.summary = itemk.content;
					}
				} else {
					itemk.summary = itemk.content;
				}
				item_list.push(itemk);
			}
		}
	}
	item_list.sort(function(a,b) { return a.date > b.date; });
	if(item_list.length > max) item_list.splice(max - 1, item_list.length - max);
	
	// record recent items
	for(var i = 0; i < item_list.length; i++) {
		//console.log("Adding [%s] to pool! ", item_list[i]._id);
		utrace.pool.push(item_list[i]._id);	
	}
    if(50 < utrace.pool.length) {
        console.log("%d old traces droped for user [%s] ...", utrace.pool.length - 50, utrace.user);
        utrace.pool.splice(0, utrace.pool.length - 50);
    }

	utrace.save(function(e2, d2) {
		if(e2) {
			console.warn("Failed to save traces for user [%s]", utrace.user);
		} else {
			console.log("Traces of user [%s] updated! ", utrace.user);
		}
	});
	return item_list;
};

module.exports = new Picker();

