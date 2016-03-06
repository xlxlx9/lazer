var Reader = function() {
}

Reader.prototype.require = function(src) {
	if(5 < src.length && "https" == src.substr(0, 5)) return require("https");
	return require("http");
}

Reader.prototype.locate = function(obj, path) {
	if(null == path || 1 > path.length) return obj;
	var sec = path.split("/");
	var t = obj;
	for(var i = 0; i < sec.length; i++) {
		if(null == t) return t;
		var key = sec[i];
		if(1 > key.length) continue;
		if(!t.hasOwnProperty(key)) {
			console.log("path seeking stops @ %s for type %s", key, typeof t);
			return null;
		}
		t = t[key];
		if(Array.isArray(t) && (1 == t.length) && (i != sec.length - 1)) { // do not scrape [] at the end
			t = t[0];
		}
	}
	return t;
}

Reader.prototype.guess = function(list, obj) {
	if(null == list || 1 > list.length) return;
	for(var i in list) {
		if(obj.hasOwnProperty(list[i])) return obj[list[i]];
	}
	return null;
}

Reader.prototype.digest = function(chunk, source) {
	var _this = this;
	require('xml2js').parseString(chunk, function(err, result) {
		if(err) {
			console.log("Parsing error for %s: %s", source.title, source.src);
			console.error(err);
			return;
		}
		var items = _this.locate(result, "rss/channel/item");
		if(null == items) items = _this.locate(result, "feed/entry");
		if(null == items) {
	   		items = _this.locate(result, "rdf:RDF/item");
		}
		if(null == items) {
			console.log("No items was found for source %s - %s", source.title, source.src);
			return;
		}
		console.log("Got %d items", items.length);
	});
}

Reader.prototype.revisit = function(gl) {
	var Source = require("../models/source");
	if(gl.reading) {
		console.log("Previous job not finished yet! Aborting...");
		return;
	}
	gl.reading = true;
	gl.error = {};
	var idx = 0;
	var _this = this;
	var data = "";
	Source.find(function(err, sources) {
		if(err) {
			console.error(err);
			return;
		}
		var callback = function(res) {
			console.log("Got one response from %s", sources[idx].src);
			res.on("data", function(chunk) {
				data += chunk;
			});
			res.on("end", function() {
				_this.digest(data, sources[idx]);
				data = "";  // clear for new request
				idx ++;
				if(idx >= sources.length) {
					gl.reading = false; // completed
					console.log("Finished for this round");
				} else {
					var si = sources[idx];
					_this.require(si.src).get(si.src, callback).on('error', on_error);
				}
			});
		};
		var on_error = function(e) {
			console.log("Got one error from %s", sources[idx].src);
			if(!(idx in gl.error)) {
				gl.error[idx] = 1;
			} else {
				gl.error[idx] ++;
			}
			if(3 <= gl.error[idx]) idx ++;
			if(idx >= sources.length) {
				gl.reading = false; // completed
				console.log("Finished for this round");
			} else {
				data = "";// clear for new request
				var si = sources[idx];
				_this.require(si.src).get(si.src, callback).on('error', on_error);
			}
		};
		var si = sources[idx];
		_this.require(si.src).get(si.src, callback).on('error', on_error);
	});
}

module.exports = new Reader();

