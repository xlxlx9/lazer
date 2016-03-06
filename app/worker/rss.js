var Reader = function() {
	this.max_recent = 12;
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
			console.info("path seeking stops @ %s for type %s", key, typeof t);
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

Reader.prototype.assemble = function(target, attr, guessList, source, warning) {
	if("undefined" == typeof warning) warning = true;
	if(null == target || null == source) return;
	if(null == attr || null == guessList || 1 > guessList.length) return;
	var value = this.guess(guessList, source);
	if((null == value) && warning) {
		console.warn("Attribute %s NOT found within [%s]", attr, guessList.join());
	}
	target[attr] = value;
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
		if((null == items) || (!Array.isArray(items))) {
			console.log("No items was found for source %s - %s", source.title, source.src);
			return;
		}
		console.log("Got %d items", items.length);
		var Item = require("../models/item");
		var rec = { cnt: 0, total: items.length, map: {}};
		if(null != source.recent && 0 < source.recent.length) {
			for(var j in source.recent) {
				rec.map[source.recent[j]] = 1;
			}
		}
		for(var i in items) {
			var it = items[i];
			var title = _this.guess(["title"], it);
			Item.findOne({ title: title, source: source._id }, function(err, unified) {
				if(err) {
					console.warn("findOne failed for title = %s, source = %s", title, source.title);
					if(null != unified) unified = null;
				}
				if(null == unified) {
					console.info("Existing item NOT found for title = %s, source = %s", title, source.title);
				}
			 	unified = unified || new Item();

				_this.assemble(unified, "author", ["author", "dc:creator"], it, false);
				_this.assemble(unified, "link", ["link"], it);
				_this.assemble(unified, "description", ["description", "content"], it);
				_this.assemble(unified, "date", ["pubDate", "dc:date", "updated"], it);
				_this.assemble(unified, "title", ["title"], it);
				unified.source = source._id;
				unified.save(function(err) {
					if(err) {
						console.warn("Failed to save item, title = %s, source = %s", title, source.title);
						rec.total --;
					} else {
						rec.cnt++;
						if(unified._id in rec.map) {
							var idx = source.recent.indexOf(unified._id);
							if(0 <= idx && idx <= source.recent.length) {
								source.recent.splice(idx, 1);
							} else {
								console.log("Failed to locate %s in %s's recent items", unified.title, source.title);
							}
						}
						source.recent.unshift(unified._id);
					}
					if(rec.cnt < rec.total) return;
					if(source.recent.length > _this.max_recent) { // trim
						source.recent.splice(_this.max_recent, source.recent.length - _this.max_recent);
					}
					source.save(function(err) {
						if(err) console.warn("Failed to flush recent items for %s", source.title);
					});
				});
			});
		}
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

