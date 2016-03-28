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
	function saveSourceAttributes(http, scope, R0) {
		if(isEmpty(scope.src.title) || isEmpty(scope.src.src)) return;
		if(scope.src.hasOwnProperty("_id")) {
			http.put("/api/sources/" + scope.src._id, scope.src)
				.success(function(data) {
					console.log("Save source succeeded");
					console.log(data);
					scope.saved = (0 == data.succ);
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

	function generateNewSource() {
		var obj = {"title": "Enter a name", "src": null, "icon": null, "cover": null, "type": "rss"};
		return obj;
	}

	function prepairSourceWithChannel(http, scope, params, R0) {
			if(null == R0 || null == R0.id2src) return;
			scope.rec = {"utmt": null, "create": "create" == params.id };
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
			scope.update = function() {
				if(null != scope.rec.utmt) {
					clearTimeout(scope.rec.utmt);
					scope.rec.utmt = null;
				}
				scope.rec.utmt = setTimeout(function() {
					saveSourceAttributes(http, scope, R0);
				}, 1500);
			};
	}

	return {"tag": assignChannelsToSources, "cook": prepairSourceWithChannel};
}();
