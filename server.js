#!/usr/bin/env node

const config = require('config');

const fs = require('fs');
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
	
	'server.port': function(v) { return v > 0; },
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

// Set up routing
const https_config = {
	key: (config.get('server.key') ? fs.readFileSync(config.get('server.key'), 'utf8') : null),
	cert: (config.get('server.cert') ? fs.readFileSync(config.get('server.cert'), 'utf8') : null),
	ca: (config.get('server.CA') ? fs.readFileSync(config.get('server.CA'), 'utf8') : null),
};
console.log(https_config);

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

	console.log('Server listening (port ' + config.get('server.port') + ')...');

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
routing.add_route_no_authenticate('/', (req,res)=>{
	return {
		active:true
	};
});
routing.add_route_no_authenticate('/version', (req,res) => {
	return {
		api_version:1
	};
});
routing.add_route_authenticate('/whoami', (req,res) => {
	return req.user;
});

fastify.listen(config.get('server.port'), '0.0.0.0');

}

main();
