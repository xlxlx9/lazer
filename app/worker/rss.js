var Reader = function() {
}

Reader.prototype.require = function(src) {
	if(5 < src.length && "https" == src.substr(0, 5)) return require("https");
	return require("http");
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
	Source.find(function(err, sources) {
		if(err) {
			console.error(err);
			return;
		}
		var callback = function(res) {
			console.log("Got one response from %s", sources[idx].src);
			idx ++;
			if(idx >= sources.length) {
				gl.reading = false; // completed
				console.log("Finished for this round");
			} else {
				var si = sources[idx];
				_this.require(si.src).get(si.src, callback).on('error', on_error);
			}
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
				var si = sources[idx];
				_this.require(si.src).get(si.src, callback).on('error', on_error);
			}
		};
		var si = sources[idx];
		_this.require(si.src).get(si.src, callback).on('error', on_error);
	});
}

module.exports = new Reader();

