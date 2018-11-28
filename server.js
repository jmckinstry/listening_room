#!/usr/bin/env node

const config = require('config');

const fs = require('fs');
//const args = require('args');
var https = require('https');
var sqlite3 = require('sqlite3');
var ws_server = null;

function f_error(error) {
	throw 'Error: ' + error.toString();
}

function update_database(db) {
	db.serialize();
	
	var res = null;
	var version = -1;
	var stat_count = 0;
	
	try {
		res = db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'schema\';')
		
		if (res !== undefined) {
			res = db.get('SELECT version FROM schema LIMIT 1;')[0];
		}
	}
	catch (e) {
		f_error(e);
	}
	
	// We have version, now execute all of the existing schema updates in order from src/server/schema
	var schema_dir = './src/server/schema/';
	var update_files = []
	fs.readdirSync(schema_dir).forEach(file => {
		var len = file.length;
		
		stat_count += 1;
		
		var stat = fs.statSync(schema_dir + file);
		
		if (!stat.isDirectory() // No directories
			&& len > 4 && file.substring(len-4) === '.sql' // No non-sql files
			&& file.substring(0,1) !== '-' // Don't you dare try to sneak a negative update in here
			&& parseInt(file.substring(0, len-4), 10) > version) { // Only include files with a number bigger than current version
				update_files.push(parseInt(file.substring(0, len-4), 10));
			}
	});
	
	update_files.sort(function(a, b) {
			if (parseInt(a, 10) < parseInt(b, 10))
				return -1;
			return 1;
	});
	
	//console.log('Testing updating of sqlite files, the sqlite update file array is:')
	//console.log(update_files);
	
	while (update_files.length) {
		var update = update_files.shift();
		console.log('Update #' + update);
		db.get('.read ' + schema_dir + update + '.sql;');
		db.get('butt', {}, f_error);
		db.get('UPDATE `schema` SET `version` = ?', update, f_error); // 0.sql always has this and is the first to run
		console.log('Update #' + update + ' completed.');
	}
	
	db.parallelize();
}


// Handle Config and Args first
// Verify contents of Config
var required_config_values = {
	'config.login_name_min_length': function(v) { return v > 0; },
	'config.login_name_max_length': function(v) { return v > 0; },
	'config.login_pass_min_length': function(v) { return v >= 0; }, // I won't stop you...
	'config.login_name_allowed_regex': function(v) { return true; }, // We'll test if it's a regex (or left blank) later
	
	'server.port': function(v) { return v > 0; },
	'server.cert': function(v) { return v !== null && v.length > 0; },
	'server.key': function(v) { return v !== null && v.length > 0; },
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
var db = new sqlite3.Database('./database.sqlite', f_error);
db.configure('trace', f_error);
update_database(db);

// Set up routing
function onHTTPSRequest(request, response) {
}


var server = https.createServer({
		key: fs.readFileSync(config.get('server.key')),
		cert: fs.readFileSync(config.get('server.cert'))
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