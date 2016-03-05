var Reader = function() {
}

Reader.prototype.require = function(src) {
	if(5 < src.length && "https" == src.substr(0, 5)) return require("https");
	return require("http");
}

Reader.prototype.guess(list, obj) {
	if(null == list || 1 > list.length) return;
	for(var i in list) {
		if(obj.hasOwnProperty(list[i])) return obj[list[i]];
	}
	return null;
}

Reader.prototype.digest = function(chunk, source) {
	require('xml2js').parseString(chunk, function(err, result) {
		if(err) {
			console.log("Parsing error for %s: %s", source.title, source.src);
			return;
		}
		var attrs = [];
		for(var k in result) {
			attrs.push(k);
		}
		console.log("attributes from %s's xml: %s", source.title, attrs.join());
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

