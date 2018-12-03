#!/usr/bin/env node

const config = require('config');

const fs = require('fs');
//const args = require('args');
var https = require('https');
var database = require('./src/server/database.js');
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
function onHTTPSRequest(request, response) {
}


var server = https.createServer({
		key: null,//fs.readFileSync(config.get('server.key')),
		cert: null,//fs.readFileSync(config.get('server.cert'))
	}, onHTTPSRequest);
	
server.listen(config.get('server.port'));

ws_server = new (require('websocket').server)({
		httpServer: server,
		autoAcceptConnections: false
	});

ws_server.on('request', function(request) {
	if (!ws_request_allowed(request)) {
		request.reject();
		console.log((new Date()) + ': WebSocket connection rejected.');
		console.log('\t' + request.toString());
		
		return;
	}
	
	// Login's allowed, hook them up	
	ws_login(request);
	
	// Hooked up, let them get back to life
	request.accept();
});

console.log('Server listening (port ' + config.get('server.port') + ')...');

}

main();
