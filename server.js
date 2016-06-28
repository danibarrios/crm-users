// Define packages needed.
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see request
var mongoose = require('mongoose'); // for working with our database
var port = process.env.PORT || 6060; // set the port for our app

var jwt = require('jsonwebtoken');
var superSecret = 'estaeslaclavesupersecretaparagenerareltoken'

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

apiRouter.post('/authenticate', function(req, res) {
	User.findOne( {
		username: req.body.username
	}).select('name username password').exec(function(err, user){
		if (err) throw err;

		if (!user) {
			res.json( {
				success: false,
				message: 'Authentication failed. User not found.'
			});
		} else if (user) {
			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.json( {
					success: false,
					message: 'Authentication failed. Wrong password'
				});
			} else {
				var token = jwt.sign({
					name: user.name,
					username: user.username
				}, superSecret);

				res.json({
					success: true,
					message: 'Enjoy your token',
					token: token
				});
			}
		}
	});
});

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
	
		// decode token
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, superSecret, function(err, decoded) {
				if (err) {
					return res.status(403).send({
					success: false,
					message: 'Failed to authenticate token.'
					});
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					next();
				}
			});
		} else {
			// if there is no token
			// return an HTTP response of 403 (access forbidden) and an error message
			return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
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

apiRouter.get('/me', function(req, res) {
	res.send(req.decoded);
});

//REGISTER OUR ROUTES
//all of our routes will be prefixed with /api
app.use('/v1/api', apiRouter);

//START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);