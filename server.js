// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var mongoose   = require('mongoose');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//mongoose.connect('mongodb://node:node@novus.modulusmongo.net:27017/Iganiq8o'); // connect to our database
mongoose.connect("mongodb://blazer:n0t_a_Doctor@ds023458.mlab.com:23458/blazer");
mongoose.connection.on('error', function (err) {
	console.log("mongoose connection err!" + err);
});


var empty = require("./app/util/empty");
var Source = require('./app/models/source');

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
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
        }, function(err, source) {
            if (err)
                res.send(err);

            res.json({ succ: 0, msg: 'Successfully deleted' });
        });
    });

// REGISTER OUR ROUTES -------------------------------

// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

