var Empty = function () {};

Empty.prototype.chreqbody = function (fields, req) {
	if(null == fields || 1 > fields.length) return;
	if(null == req) return ;
	for(var i in fields) {
		var f = fields[i];
		var val = req.body[f];
		if((null != val) && (("string" != typeof val) || (0 < val.length))) continue;
		console.log("Empty field: %s", f);
		return true;
	}
	return false;
};

module.exports = new Empty();
 
