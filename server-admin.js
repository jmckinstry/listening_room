#!/usr/bin/env node

const args = require('minimist')(process.argv.slice(2));
const salt = require('./src/server/salt.js');

var config = require('config');
var database = require('./src/server/database.js');

var functions = {};

// TODO: Dedupe this
function f_error(error) {
	if (error !== null) {
		throw 'Error: ' + error.toString();
	}
};

async function main() {	
	await database.connect('./database.sqlite', f_error);
	
	// Handle whatever option was chosen
	if (args._.length == 0) {
		console.log('No command provided');
		
		print_help();
		process.exit(1);
	}
	
	const command = args._[0];

	if (!functions.hasOwnProperty(command)) {
		console.log('No command named ' + command.toString());
		
		print_help();
		process.exit(1);
	}
	
	//console.log('Calling ' + command + ':');
	functions[command](args);
};

function print_help() {
	// Things can go here if we pretty up functions entries to include descriptions and inputs
};

functions['get-salt'] = async function (args) {
	var server_salt = await salt.get_salt(database);
	console.log(server_salt);
};

functions['set-salt'] = async function (args) {
	salt_length = 32;
	
	if (!args.salt) {
		console.log('set-salt requires:');
		console.log('\t--salt=<salt>: The new server salt to use');
		
		process.exit(1);
	}
	if (args.salt.length != salt_length) {
		console.log('Salt value must be ' + salt_length + ' hexadecimal characters');
		
		process.exit(1);
	}
	
	try {
		salt.set_salt(database, args.salt);
	}
	catch (err) {
		console.trace(err);
	}
};

functions['add-admin'] = async function (args) {
	if (!args.name || !args.pass) {
		console.log('add-admin requires:');
		console.log('\t--name=<name>: The name of the account');
		console.log('\t--pass=<pass>: The unencrypted password of the account');	
		
		process.exit(1);
	}
	
	const crypto = require('crypto');
	var server_salt = await salt.get_or_make_salt(database);
	
	// Check constraints
	if (config.config.login_name_min_length > args.name.length) {
		console.log('Name must be at least ' + config.config.login_name_min_length + ' characters long.');
		process.exit(2);
	}
	if (config.config.login_name_max_length < args.name.length) {
		console.log('Name cannot be longer than ' + config.config.login_name_man_length + ' characters.');
		process.exit(2);
	}
	if (config.config.login_pass_min_length > args.pass.length) {
		console.log('Password must be at least ' + config.config.login_pass_min_length + ' characters long.');
		process.exit(2);
	}
	
	// Make sure the user doesn't already exist
	var user_id = undefined;
	var res = await database.db.get('SELECT `user_id` FROM `user` WHERE `name` = "' + args.name + '";');
	if (res && res.user_id) {
		user_id = res.user_id;
	}
	if (user_id) {
		console.log('User "' + args.user + '" already exists with ID ' + user_id);
		
		process.exit(3);
	}
	
	// Make the encrypted password
	crypto.scrypt(args.pass, server_salt, config.config.scrypt_dkLen, {N:config.config.scrypt_N, r:config.config.scrypt_r, p:config.config.scrypt_p}, async(err, key) => {
		if (err) {
			throw err;
		}
		
		var hash = key.toString('hex');
		try {
			await database.db.run('BEGIN TRANSACTION');
			await database.db.run('INSERT INTO `user` (`name`, `pass`) VALUES ("' + args.name + '", "' + hash + '");');
			res = await database.db.get('SELECT `user_id` FROM `user` WHERE `name` = "' + args.name + '";');
			if (res && res.user_id) {
				user_id = res.user_id;
			}
			if (!user_id) {
				throw 'Failed to get new user id for ' + args.name;
			}
		}
		catch (err) {
			console.log(err);
			process.exit(3);
		}
		
		try {
			await database.db.run('INSERT INTO `user_perm` (`user_id`, `perm_id`, `value`) VALUES (1, (SELECT `perm_id` FROM `perm` WHERE `name`="admin"), "true");');
			await database.db.run('COMMIT TRANSACTION');
		}
		catch (err) {
			// Must clean up previous work
			try {
				await database.db.run('ROLLBACK');
			}
			catch (err) {}
			
			console.log(err);
			process.exit(3);
		}
	});
};

main();
