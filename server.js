#!/usr/bin/env node

const config = require('config');

const fs = require('fs');
const crypto = require('crypto')
//const args = require('args');
//var https = require('https');
var fastify = require('fastify');
var database = require('./src/server/database.js');
var routing = require('./src/server/routing.js');
var ws_server = null;

// TODO: Dedupe this
function f_error(error) {
	if (error !== null)
		throw 'Error: ' + error.toString();
}

async function main() {

// Handle Config and Args first
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
	
// Configure the database, installing/updating as necessary
await database.connect('./database.sqlite', f_error);
await database.run_updates()

// Set the server salt if necessary
if (!config.get('config.salt')) {
	var val = Buffer.alloc(16);
	crypto.randomFillSync(val);
	console.log("new key is " + val.toString('hex') + " but we need some config magic to make it work");
	//config.put('config.salt', val.toString('hex'));
}

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
	res.code(200).header('Content-Type', 'image/x-icon').send(fs.readFileSync('src/client/images/favicon.ico'));
});
routing.add_route_no_authenticate('/api/active', (req,res)=>{
	return {
		active:true
	};
});
routing.add_route_no_authenticate('/api/config', (req,res) => {
	return config.get('config');
});
routing.add_route_no_authenticate('/api/version', (req,res) => {
	return {
		api_version:1
	};
});
routing.add_route_no_authenticate('/api/login', (req,res) => {
	console.log(req);
	
	return {
		api_version:1
	};
});
routing.add_route_authenticate('/api/whoami', (req,res) => {
	return req.user;
});

fastify.listen(config.get('config.port'), '0.0.0.0');

}

main();
