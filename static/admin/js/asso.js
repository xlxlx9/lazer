Asso = function() {
	function assignChannelsToSources(scope) {
		if(null == scope.sources) return;
		if(null == scope.channels) return;
		
		var id2src = scope.srcmap = {};
		for(var i = 0; i < scope.sources.length; i++) {
			var src_i = scope.sources[i];
			id2src[src_i._id] = src_i;
			src_i.tags = [];
		}
		for(var i = 0; i < scope.channels.length; i++) {
			var ch_i = scope.channels[i];
			for(var j = 0; j < ch_i.sources.length; j++) {
				var src_id = ch_i.sources[j];
				//console.log("Adding tag " + ch_i.title + " to " + src_id);
				var src_j = id2src[src_id];
				if(null == src_j) continue;
				src_j.tags.push(ch_i);
			}
		}
	}
	
	return {"tag": assignChannelsToSources };
}();
