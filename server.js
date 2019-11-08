#!/usr/bin/env node

var config = require('config');

const fs = require('fs');
const salt = require('./src/server/salt.js');

var fastify = require('fastify');
var database = require('./src/server/database.js');
var routing = require('./src/server/routing.js');
var session = require('./src/server/session.js');
var login = require('./src/server/login.js');
var random = require('./src/server/random.js');
var ws_server = null;

// TODO: Dedupe this
function f_error(error) {
	if (error !== null) {
		throw 'Error: ' + error.toString();
	}
}

async function main() {

// Configure the database, installing/updating as necessary
await database.connect('./database.sqlite', f_error);
await database.run_updates();

// We set the salt immediately, before any config.get(...) calls are made, because config.get(...) makes config immutable
var server_salt = await salt.get_or_make_salt(database);

config.config.salt = server_salt;

// Handle Config
// Verify contents of Config
var required_config_values = {
	'config.login_name_min_length': function(v) { return v > 0; },
	'config.login_name_max_length': function(v) { return v > 0; },
	'config.login_pass_min_length': function(v) { return v >= 0; }, // I won't stop you...
	'config.login_name_allowed_regex': function(v) { return true; }, // We'll test if it's a regex (or left blank) later
	'config.port': function(v) { return v > 0; },
	
	'server.cert': function(v) { return v === null || v.length > 0; },
	'server.key': function(v) { return v === null || v.length > 0; },
}

for (key in required_config_values) {
	if (!required_config_values.hasOwnProperty(key)) continue;
	
	if (!config.has(key) || !required_config_values[key](config.get(key))) {
		throw 'Config Error: ' + key + ' is not set correctly.';
	}
}
// Specialty checks
if (config.get('config.login_name_min_length') > config.get('config.login_name_max_length')) {
	throw 'Config Error: config.login_name_min_length must be less than config.login_name_min_length';
}

// Args overwrite existing config
//args.option('port', 'The web server port to listen on.', config.get('config.port'))

console.log('Server salt: ' + config.get('config.salt'))

// Set up routing
const https_config = {
	key: (config.get('server.key') ? fs.readFileSync(config.get('server.key'), 'ascii') : null),
	cert: (config.get('server.cert') ? fs.readFileSync(config.get('server.cert'), 'ascii') : null),
	ca: (config.get('server.CA') ? fs.readFileSync(config.get('server.CA'), 'ascii') : null),
};

fastify = fastify({
	https: https_config.key ? https_config : null,
	logger: true
});

routing.init(
	fastify, 
	database, 
	(request) => {
		if (request.user) {
			console.log('User request for user id: ' + request.user.user_id);
		}
		
		return {};
	}
);
fastify.register(require('fastify-ws'), {
  library: 'ws' // NEVER USE uws LIBRARY, ITS DEPRECATED AND REMOVED
});

fastify.ready((err) => {
	if (err) throw err

	console.log('Server listening (port ' + config.get('config.port') + ')...');

	fastify.ws.on('connection', (socket) => {
		console.log('ws: Client connect');
		
		socket.on('message', (data) => {
			console.log('ws: Client data: ' + data);
			socket.send(data); // Creates an echo server
		});
		
		socket.on('close', () => {
			console.log('ws: Client disconnected.')
		});
	})
});

// Actual routes
fastify.register(require('fastify-static'), {
	root: require('path').join(__dirname, '/client'),
	prefix: '/',
});
fastify.get('/favicon.ico', async(req,res)=>{
});

// Non-authenticated routes
routing.add_route_no_authenticate('GET', '/api/active', (req,res) => {
	return {
		active:true
	};
});
routing.add_route_no_authenticate('GET', '/api/config', (req,res) => {
	return config.get('config');
});
routing.add_route_no_authenticate('GET', '/api/version', (req,res) => {
	return {
		api_version:1
	};
});
var nonce_queue = new Array();
var nonce = 0;
routing.add_route_no_authenticate('GET', '/api/login_nonce', (req,res) => {
	// Clear out old nonces
	current_seconds = parseInt(Date.now().toString().substr(0,10))
	while ((x = nonce_queue.shift()) && x['time'] + config.login_nonce_seconds < current_seconds) {}
	if (x) nonce_queue.unshift(x)

	// If there is something stupid going on, don't kill the server with nonces
	if (nonce_queue.length > 100000) {
		throw 'Nonce list full (bug or dos attack)'
	}

	// TODO: Add a list of nonce creates per IP so we can rate limit them if necessary
	console.log(random)

	random_val = random.get_random_hex(8);
	new_nonce = {'time':current_seconds, 'nonce':nonce++, 'val':random_val}
	nonce_queue.push(new_nonce)

	return {
		nonce:new_nonce['nonce'],
		val:new_nonce['val']
	};
});
routing.add_route_no_authenticate('POST', '/api/login', (req,res) => {
	//console.log(req.body);
	console.log('login attempt (' + req.body.name + ', ' + req.body.hash + ', ' + req.body.nonce + '): ');

	// Find and remove the nonce they're using
	nonce = undefined
	for (i in nonce_queue) {
		if (nonce_queue[i]['nonce'] == req.body.nonce) {
			nonce = nonce_queue[i]
			nonce_queue.splice(i,1)

			break;
		}
	}

	if (!nonce) {
		throw 'Nonce expired or does not exist.';
	}

	// Do the login attempt
	var user_id = login.verify_login(db, req.body.name, req.body.hash, nonce['val']);

	if (!user_id) {
		return {
			success:false
		};
	}

	var session_id = session.create_session(db, req.address, user_id);

	if (!session_id) {
		return {
			success:false
		};
	}
	
	return {
		success:true,
		session_id:session_id
	};
});

// Authenticated routes
routing.add_route_authenticate('GET', '/api/whoami', (req,res) => {
	if (req.user) {
		return req.user;
	}
});

fastify.listen(config.get('config.port'), '0.0.0.0');

}

main();
