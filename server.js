// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var mongoose   = require('mongoose');

var nconf = require("nconf");
nconf.argv().env();
var cfg_name = nconf.get("conf") || "conf.json";
nconf.file({ "file": cfg_name });
nconf.defaults({
	  "port": 8080
	, "database": "mongodb://blazer:n0t_a_Doctor@127.0.0.1:27017/blazer"
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(nconf.get("database"));
mongoose.connection.on('error', function (err) {
	console.log("mongoose connection err!" + err);
});

var empty = require("./app/util/empty");
var Item = require('./app/models/item');
var Source = require('./app/models/source');
var Channel = require('./app/models/channel');
var rss = require("./app/worker/rss");
var chalk = require("chalk");

var port = nconf.get("port");
var gl = { rss: {} };

if(nconf.get("hurry")) {
	console.log(chalk.blue("Start scraping in 5 sec! "));
	setTimeout(function() {
		rss.revisit(gl.rss);
	}, 5 * 1000);
}

var minutes = 10;
setInterval(function() {
	rss.revisit(gl.rss);
}, minutes * 60 * 1000);

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log("Someone is up to someting! ");
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ msg: "We like you!" });
});

// more routes for our API will happen here

// on routes that end in /sources
// ----------------------------------------------------
router.route('/sources')

    // create a source (accessed at POST http://localhost:8080/api/sources)
    .post(function(req, res) {
		if(empty.chreqbody(["title", "src"], req)) res.send( { succ: -10 } );
        var source = new Source();      // create a new instance of the Source model
        source.title = req.body.title;  // set the sources name (comes from the request)
		source.src = req.body.src;
		source.type = req.body.type;
		source.icon = req.body.icon;

        source.save(function(err) {
            if (err)
                res.send(err);

            res.json({ succ:0, msg: 'Source created!' });
        });
        
    })

// get all the sources (accessed at GET http://localhost:8080/api/sources)
    .get(function(req, res) {
        Source.find(function(err, sources) {
            if (err)
                res.send(err);

            res.json(sources);
        });
    });

// on routes that end in /sources/:source_id
// ----------------------------------------------------
router.route('/sources/:source_id')

    // get the source with that id (accessed at GET http://localhost:8080/api/sources/:source_id)
    .get(function(req, res) {
        Source.findById(req.params.source_id, function(err, source) {
            if (err)
                res.send(err);
            res.json(source);
        });
    })

    // update the source with this id (accessed at PUT http://localhost:8080/api/sources/:source_id)
    .put(function(req, res) {

		if(empty.chreqbody(["title", "src"], req)) res.send( { succ: -10 } );
        // use our source model to find the source we want
        Source.findById(req.params.source_id, function(err, source) {

            if (err)
                res.send(err);

            source.title = req.body.title;  // update the sources info
			source.src = req.body.src;
			source.type = req.body.type;
			source.icon = req.body.icon;

            // save the source
            source.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ succ: 0, msg: 'Source updated!' });
            });

        });
    })

// delete the source with this id (accessed at DELETE http://localhost:8080/api/sources/:source_id)
    .delete(function(req, res) {
        Source.remove({
            _id: req.params.source_id
        }, function(err) {
            if(err)
                res.send(err);
			Item.remove({ source: req.params.source_id }, function(e2) {
				if(e2) res.send(e2);
				res.json({ succ: 0, msg: 'Successfully deleted' });
			});
        });
    });

router.route("/channels")
	  .post(function(req, res) { // create a new channel
			  if(empty.chreqbody(["title"], req)) {
				res.send({ succ: -9, msg:"empty title!" });
			  	return;
			  }
			  Channel.findOne({ title: req.body.title }, function(e0, doc) {
				  if(e0) {
				  	console.log("Unable to test title uniquness for %s", req.body.title);
					res.send(e0);
				  } else if(null != doc) {
				  	res.send({ succ: -5, msg: "Duplicated channel title" });
				  } else {
					  var channel = new Channel();
					  channel.title = req.body.title;
					  channel.rank = req.body.rank;
					  channel.sources = req.body.sources || [];

					  channel.save(function(err) {
						  if(err) res.send(err);
						  res.send({ succ: 0, msg: "Channel created! " });
					  });
				  }
			  });
		})
	  .get(function(req, res) { // list all channel
			  Channel.find(function(err, channels) {
				  if(err) res.send(err);
				  res.send({ succ: 0, channels: channels });
			  });
	  })
	  ;
router.route("/channels/:channel_id")
	  /*
	  .get(function(req, res) { // find a channel by id
		  Channel.findById(req.params.channel_id, function(err, channel) {
			if(err) res.send(err);
			res.send(channel);
		  });
	  }) */
	    // test populate
	  .get(function(req, res) { // find a channel by id
		  Channel.findById(req.params.channel_id).populate("sources").exec(function(err, channel) {
			if(err) res.send(err);
			res.send(channel);
		  });
	  })
	  
	  .put(function(req, res) {
	  	  if(empty.chreqbody(["title"], req)) res.send({ succ: -9 });
		  Channel.findById(req.params.channel_id, function(err, channel) {
			if(err) res.send(err);
			channel.title = req.body.title;
			channel.rank = req.body.rank;
			channel.sources = req.body.sources || [];
			channel.save(function(err) {
				if(err) res.send(err);
				res.send({ succ: 0, msg: "Channel updated" });
			});
		  });
	  })
	  .delete(function(req,res) {
		  Channel.remove({ _id: req.params.channel_id }, function(err, channel) {
			if(err) res.send(err);
			res.send({ succ: 0, msg: "Channel deleted! " });
		  });
	  })
	  ;

router.route("/channels/:channel_id/:source_id")
	  .put(function(req, res) {
		  Channel.findById(req.params.channel_id, function(err, channel) {
			if(err) res.send(err);
			Source.findById(req.params.source_id, function(e2, source) {
				if(err) res.send(e2);
				for(var i in channel.sources) {
					if(channel.sources[i] == req.params.source_id) {
						res.send({ succ: -20 }); // duplica
						return;
					}
				}
				channel.sources.push(req.params.source_id);
				channel.save(function(e3) {
					if(err) res.send(e3);
					res.send({ succ: 0, msg: "Source added to channel" });
				});
			});
		  });
	  })
	  .delete(function(req, res) {
		  Channel.findById(req.params.channel_id, function(err, channel) {
			if(err) res.send(err);
			for(var i = 0; i < channel.sources.length; i++) {
				if(channel.sources[i] == req.params.source_id) {
					channel.sources.splice(i, 1);
					channel.save(function(e3) {
						if(err) res.send(e3);
						res.send({ succ: 0, msg: "Source deleted to channel" });
					});
					return;
				}
			}
			res.send({ succ: -30 }); // source not in this channel
		  });
		  
	  });
router.route("/items")
	  .get(function(req,res) {
		  if(empty.chreqquery(["source"], req)) res.send({ succ: -40, msg:"Specify source by id, please" });
		  Item.find({ source: req.query.source }).limit(100).exec(function(err, items) {
			  if(err) res.send(err);
			  res.send({ succ: 0, items: items, source: req.params.source });
		  });
	  })
	  .delete(function(req, res) {
		  if(empty.chreqquery(["source"], req)) res.send({ succ: -40, msg:"Specify source by id, please" });
		  Item.remove({ source: req.query.source }, function(err) {
			  if(err) res.send(err);
			  Source.findById(req.query.source, function(err, source) {
				  if(err || null == source) {
			  		res.send({ succ: -51, msg:"items cleared, but failed to locate in sources: " + req.query.source }); 
				  } else {
				  	source.recent = [];
					source.save(function(e2) {
						if(e2) res.send({ succ: -55, msg:"failed to reset recent items for: " + source.title });
						res.send({ succ: 0, msg:"items cleared for " + source.title });
					});
				  }
			  });
		  });
	  })
	  ;
router.route("/subscriptions")
	  .get(function(req, res) {
		  Channel.find({}, { title: true, rank: true }, function(err, docs) {
			  if(err) {
			  	res.send(err);
			  } else {
			  	res.send({ succ: 0, channels: docs });
			  }
		  });
	  });

router.route("/subscriptions/:uid")
	.post(function(req, res) {
		var channels = req.body.channels;
		if(null == channels || 1 > channels.length) {
			res.send({ succ: -80, msg:"Empty subscription" });
		}
		Channel.find({ "_id": { $in: channels } })
			   .populate({ path:"sources", populate: { path:"recent", model:Item} })
			   .exec(function(err, docs) {
				   	if(err) res.send(err);
					console.log("Found channels in total: %d", docs.length);
					var items = require("./app/util/pick").pick(docs, 10 * 60);
					res.send({ succ: 0, items: items });
				});
	})
	;

// REGISTER OUR ROUTES -------------------------------

// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log(chalk.yellow('Magic happens on port %d'), port);

