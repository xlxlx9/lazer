Asso = function() {
	function assignChannelsToSources(scope, R0) {
		if(null == scope.sources) return;
		if(null == scope.channels) return;

		var id2src = {};
		R0.id2src = id2src;
		R0.sources_data = scope.sources;
		for(var i = 0; i < scope.sources.length; i++) {
			var src_i = scope.sources[i];
			id2src[src_i._id] = src_i;
			src_i.tags = [];
		}
		R0.id2ch = {};
		R0.channels_data = scope.channels;
		for(var i = 0; i < scope.channels.length; i++) {
			var ch_i = scope.channels[i];
			R0.id2ch[ch_i._id] = ch_i;
			for(var j = 0; j < ch_i.sources.length; j++) {
				var src_id = ch_i.sources[j];
				//console.log("Adding tag " + ch_i.title + " to " + src_id);
				var src_j = id2src[src_id];
				if(null == src_j) continue;
				src_j.tags.push(ch_i);
			}
		}
	}
	function isEmpty(val) {
		return (null == val) || (0 == val.trim().length);
	}
	function isURL(str) {
		if(null == str) return false;
		if(8 > str.length) return false;
		return true;
	}
	function saveSourceAttributes(http, scope, R0) {
		if(isEmpty(scope.src.title) || isEmpty(scope.src.src)) return;
		scope.saved = false;
		if(scope.src.hasOwnProperty("_id")) {
			http.put("/api/sources/" + scope.src._id, scope.src)
				.success(function(data) {
					console.log("Save source succeeded");
					console.log(data);
					scope.rec.saved = (0 == data.succ);
					scope.rec.save_stamp = new Date();
				})
				.error(function(error, data) {
						console.log("Failed to update source: ");
						console.log(error);
				})
				;
			return;
		}
		http.post("/api/sources", scope.src)
			.success(function(data) {
				if(0 == data.succ) {
					scope.src["_id"] = data.id; // sync repo
					scope.src.since = data.since;
					scope.rec.create = false;
					scope.rec.saved = true;
					scope.rec.save_stamp = new Date().toLocaleDateString();
					R0.sources_data.unshift(scope.src);
					R0.id2src[data.id] = scope.src;
					scope.all_ch = R0.channels_data.concat();
				} else {
					console.log("Failed to save new source");
				}
			})
			.error(function(error, data) {
					console.log("Failed to save new source: ");
					console.log(error);
			})
			;
	}
	function src2ch(src, ch, http, scope) {
		if(ch.active) {
			http.delete("/api/channels/" + ch._id + "/" + src._id)
				.success(function(data) {
					if(0 != data.succ) {
						console.log("Failed to detach " + src.title + " from " + ch.title);
						return;
					}
					ch.active = false;
					var idx = src.tags.indexOf(ch);
					if(-1 != idx) src.tags.splice(idx, 1);
					else console.log("Failed to remove channel from source tag list");
					idx = ch.sources.indexOf(src._id);
					if(-1 != idx) ch.sources.splice(idx, 1);
					else console.log("Failed to remove source id from channel");
				})
				.error(function(error, data) {
					console.log(error);
				})
				;
		} else {
			http.put("/api/channels/" + ch._id + "/" + src._id)
				.success(function(data) {
					if(0 != data.succ) {
						console.log("Failed to attach " + src.title + " from " + ch.title);
						return;
					}
					ch.active = true;
					ch.sources.push(src._id);
					src.tags.push(ch);
				})
				.error(function(error, data) {
					console.log(error);
				})
				;
		}
	}

	function generateNewSource() {
		var obj = {"title": "Enter a name", "src": null, "icon": null, "cover": null, "type": "rss"};
		return obj;
	}

	function addNewChannel(ch, http, scope, R0) {
		http.post("/api/channels", ch)
			.success(function(data) {
				if(0 != data.succ) {
					console.log(data.msg);
					return;
				}
				scope.rec.newch = {"title": "Add a new channel here"};
				ch._id = data.id;
				ch.sources = [];
				R0.channels_data.push(ch);
				R0.id2ch[data.id] = ch;
				scope.all_ch.push(ch);
			})
			.error(function(error, data) {
				console.log(error);
			})
			;
	}
	
	function updateChannel(ch, http) {
		if(!ch.hasOwnProperty("_id")) {
			console.log("Error: no _id in channel");
			return;
		}
		http.put("/api/channels/" + ch._id, ch)
			.success(function(data) {
				ch.editing = false;
			})
			.error(function(error, data) {
				console.log(error);
			})
			;
	}

	function prepairSourceWithChannel(http, scope, params, R0) {
			if(null == R0 || null == R0.id2src) return;
			scope.rec = {	  "utmt": null
							, "create": ("create" == params.id)
							, "newch": {"title": "Add a new channel here"}
			};
			scope.src = scope.rec.create? generateNewSource() : R0.id2src[params.id];
			scope.all_ch  = [];
			if(!scope.rec.create) {
				var ol = R0.channels_data;
				var active_ch= {};
				for(var i = 0; i < scope.src.tags.length; i++) {
					var ch_i = scope.src.tags[i];
					active_ch[ch_i._id] = ch_i;
				}
				for(var i = 0; i < ol.length; i++) {
					var ch_i = ol[i];
					ch_i.active = active_ch.hasOwnProperty(ch_i._id);
					if(ch_i.active) scope.all_ch.unshift(ch_i);
					else scope.all_ch.push(ch_i);
				}
			}
			scope.is_url = isURL;
			scope.update = function() {
				if(null != scope.rec.utmt) {
					clearTimeout(scope.rec.utmt);
					scope.rec.utmt = null;
				}
				scope.rec.utmt = setTimeout(function() {
					saveSourceAttributes(http, scope, R0);
				}, 1500);
			};
			scope.switch = function(ch, src) {
				src2ch(src, ch, http, scope);
				//console.log("Switching src[" + src._id + "] with ch[" + ch._id + "]");
			};
			scope.chadd = function(ch) {
				//console.log("New channel: " + ch.title);
				addNewChannel(ch, http, scope, R0);
			}
			scope.chflip = function(ch) {
				if(null == ch.editing || !ch.editing) ch.editing = true;
				else ch.editing = false;
			}
			scope.chput = function(ch) {
				updateChannel(ch, http);
			}
	}

	return {"tag": assignChannelsToSources, "cook": prepairSourceWithChannel};
}();
