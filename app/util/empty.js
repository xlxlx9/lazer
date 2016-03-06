var Empty = function () {};

Empty.prototype.chreqbody = function (fields, req) {
	if(null == fields || 1 > fields.length) return false;
	if(null == req) return false;
	for(var i in fields) {
		var f = fields[i];
		var val = req.body[f];
		if((null != val) && (("string" != typeof val) || (0 < val.length))) continue;
		console.log("Empty field: %s", f);
		return true;
	}
	return false;
};

Empty.prototype.chreqparam = function (fields, req) {
	if(null == fields || 1 > fields.length) return false;
	if(null == req) return false;
	for(var i in fields) {
		var f = fields[i];
		var val = req.params[f];
		if((null != val) && (("string" != typeof val) || (0 < val.length))) continue;
		console.log("Empty field: %s", f);
		return true;
	}
	return false;
};

Empty.prototype.chreqquery = function (fields, req) {
	if(null == fields || 1 > fields.length) return false;
	if(null == req) return false;
	for(var i in fields) {
		var f = fields[i];
		var val = req.query[f];
		if((null != val) && (("string" != typeof val) || (0 < val.length))) continue;
		console.log("Empty field: %s", f);
		return true;
	}
	return false;
};

module.exports = new Empty();
 
