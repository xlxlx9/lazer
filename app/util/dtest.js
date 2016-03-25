// NOT used in server or extractor. 
var d1 = new Date();
console.log("d1 = " + d1);

var d2 = new Date();
console.log("d2 = " + d2);

d2.setHours(0);
d2.setMinutes(0);
d2.setSeconds(0);
d2.setDate(d1.getDate() + 10);
console.log("new d2 = " + d2 + ", date = " + d2.getDate());

process.exit(0);
