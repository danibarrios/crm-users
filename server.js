// Define packages needed.
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see request
var mongoose = require('mongoose'); // for working with our database
var port = process.env.PORT || 6060; // set the port for our app

var User = require('./app/models/user');

//APP CONFIGURATION -------
//use body parser so we can grab information from POST requests

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connect to our database (hosted on modulus.io)
//mongoose.connect('mongodb://node:noder@novus.modulusmongo.net:27017/Iganiq8o');
mongoose.connect('mongodb://localhost:27017/myDataBase');

//configure our app to handle CORS request
app.use( function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

//log all requests to the console
app.use(morgan('dev'));

//ROUTES FOR OUR API

app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});

// get an instace of the express router

var apiRouter = express.Router();

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
	// do logging
	console.log('Somebody just came to our app!');

	next(); // make sure we go to the next routes and don't stop here
});

apiRouter.get('/', function(req, res) {
	res.json({message: 'Hooray! welcome to our api!' });
});

apiRouter.route('/users')
	
	.post(function(req, res){

		var user = new User();

		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;
		// save the user and check for errors
		user.save(function(err) {
			if (err) {
				if (err.code == 11000)
					return res.json({success: false, message: 'A user with that username already exists. '});
				else
					return res.send(err);
			}
			res.json({ message: 'User created!' });
		});
	})

	.get(function(req, res) {
		User.find(function(err, users){
			if (err) res.send(err);

			res.json(users);
		});
	});

apiRouter.route('/users/:user_id')

	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) res.send(err);

			res.json(user);
		});
	})

	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if(err) res.send(err);

			if (req.body.name) user.name = req.body.name;
			if (req.body.username) user.username = req.body.username;
			if (req.body.password) user.password = req.body.password;

			user.save(function(err) {
				if (err) res.send(err);

				res.json({ message: 'User updated!'});
			});
		});
	})

	.delete(function(req, res) {
		User.remove({
		_id: req.params.user_id
		}, function(err, user) {
			if (err) return res.send(err);
			res.json({ message: 'Successfully deleted' });
		});
	});

//REGISTER OUR ROUTES
//all of our routes will be prefixed with /api
app.use('/v1/api', apiRouter);

//START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);