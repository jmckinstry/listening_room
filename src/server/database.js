#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
var sqlite = require('sqlite');

// TODO: Dedupe this
function f_error(error) {
	console.trace('f_error: ' + new Error().stack);
	throw 'Error: ' + error.toString();
}

var dbo = {

db: null,

connect: async function connect(filename) {
	this.db = await sqlite.open(filename, {Promise});
	//this.db.configure('trace', f_trace);
	
	//this.db.serialize(); // sqlite3 lies about its synchronicity. Serializing just reduces mutex thrash on non-db operations and changes nothing about db operations.
	
	return this.db;
},

disconnect: function() {
	if (this.db) {
		this.db.close();
	}
	this.db = null;
},

// Only call this when there are no other pending messages, events, whatnot in order to protect the database's integrity.
// It is recommended to call "await <object>.run_updates" on the main thread while there are no other async processes going on.
run_updates: async function run_updates() {
	if (!this.db) {
		throw 'Connection not initialized.';
	}
	
	var res = null;
	var version = -1;
	var stat_count = 0;
	
	try {
		res = await this.db.get('SELECT name FROM `sqlite_master` WHERE type=\'table\' AND name=\'schema\';');
		
		if (res) {
			version = (await this.db.get('SELECT version FROM schema LIMIT 1;')).version;
		}
	}
	catch (e) {
		f_error('Error finding table names during database configuration: ' + e);
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
		try {
			await this.db.run('BEGIN TRANSACTION');
			
			await this.db.exec(fs.readFileSync(schema_dir + update + '.sql', 'utf8'));
			
			await this.db.run('UPDATE `schema` SET `version` = ?', update); // 0.sql always has this and is the first to run
			
			await this.db.run('COMMIT TRANSACTION');
		}
		catch (err) {
			f_error(err);
		}
			
		console.log('Update #' + update + ' completed.');
	}
	
	// Dump out the current schema version for logging
	var current_version = (await this.db.get('SELECT `version` FROM `schema` LIMIT 1')).version;
	console.log('Current schema version: ' + util.inspect(current_version));
},

};

module.exports = dbo;
