var Picker = function() {
};

var default_cover = "https://doc-10-20-docs.googleusercontent.com/docs/securesc/ha0ro937gcuc7l7deffksulhg5h7mbp1/3n2hcvm8eevs8jr8pii30fkot5i8f677/1458849600000/15174552360402620764/*/0BzHBzik_hopRN2VvaVF2S1V5QUU?e=download";
var default_ico = "https://doc-08-20-docs.googleusercontent.com/docs/securesc/ha0ro937gcuc7l7deffksulhg5h7mbp1/uo5l23kslareu5df02hsqps8ffeh2c6l/1458849600000/15174552360402620764/*/0BzHBzik_hopRZlR0aGs3TWpFelU?e=download";

Picker.prototype.pick = function(docs, seconds) {
	var item_list = [];
	var explored = {};
	for(var i = 0; i < docs.length; i++) {
		var ch = docs[i];
		for(var j = 0; j < ch.sources.length; j++) {
			var srcj = ch.sources[j];
			//console.log("source key: %s", j);
			if(null == srcj) continue;
			if(srcj._id in explored) continue;
			explored[srcj._id] = 1;
			//console.info("adding item from source: %s - %s", srcj.title, srcj._id);
			for(var k = 0; k < srcj.recent.length; k++) {
				var itemk = srcj.recent[k];
				itemk.icon = srcj.icon; 
				if(null == itemk.icon || "" == itemk.icon) {
					itemk.icon = default_ico;
				}
				if(null == itemk.cover || "" == itemk.cover) {
					itemk.cover = srcj.cover;
				}
				if(null == itemk.cover || "" == itemk.cover) {
					itemk.cover = default_cover;
				}
				item_list.push(itemk);
			}
		}
	}
	item_list.sort(function(a,b) { return a.date > b.date; });
	var max = Math.ceil(seconds / 160);
	if(item_list.length > max) item_list.splice(max - 1, item_list.length - max);
	return item_list;
};

module.exports = new Picker();

