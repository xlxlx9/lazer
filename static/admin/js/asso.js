Asso = function() {
	function assignChannelsToSources(scope, R0) {
		if(null == scope.sources) return;
		if(null == scope.channels) return;
		
		var id2src = {};
		R0.id2src = id2src;
		for(var i = 0; i < scope.sources.length; i++) {
			var src_i = scope.sources[i];
			id2src[src_i._id] = src_i;
			src_i.tags = [];
		}
		R0.id2ch = {};
		R0.channels = scope.channels;
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

	function prepairSourceWithChannel(scope, params, R0) {
			if(null == R0 || null == R0.id2src) return;
			scope.src = R0.id2src[params.id];
			scope.all_ch  = [];
			var ol = R0.channels;
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

	return {"tag": assignChannelsToSources, "cook": prepairSourceWithChannel};
}();
