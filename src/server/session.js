#!/usr/bin/env node

const random = require('./random.js');

var session = {
	
verify_session: async function (db, address, user_id, session) {
	try {
		var res = db.db.get('SELECT 1 AS "found" FROM `session` WHERE '
			+ '`address` = "' + address + '"'
			+ ' AND `user_id` = ' + user_id + ''
			+ ' AND `session` = "' + session + '"'
			+ ' LIMIT 1');
		
		if (res && res.found) {
			return true;
		}
	}
	catch (err) {
		console.log(err);
	}
	
	return false;
},

// Invalidate old sessions, create a new session entry, and return the created session ID
// Returns undefined on failure, UUID for session otherwise
create_session: async function (db, address, user_id) {
	var session;
	
	// Invalidate all other sessions for this user_id (if a user wants multiple sessions, it should be through an agent API and not through user login)
	try {
		session = random.get_random_hex(16);
		
		await db.db.run('BEGIN TRANSACTION;');
		await db.db.run('DELETE FROM `session` WHERE `user_id` = ' + user_id + ';');
		await db.db.run('INSERT INTO `session` (`address`, `user_id`, `session`, `expires_date`) VALUES ('
			+ '"' + address + '",'
			+ '"' + user_id + '",'
			+ '"' + session + '",'
			+ 'DATETIME("now")'
			+ ');');
		await db.db.run('COMMIT TRANSACTION;');
	}
	catch (err) {
		try {
			await db.db.run('ROLLBACK TRANSACTION;');
		}
		catch (err) {}
		
		return undefined;
	}
	
	return session;
},

clear_old_sessions: async function (db, config) {
	// TODO: Add adjustable timing to configuration
	db.db.run('DELETE FROM `session` WHERE `expires_date` < DATETIME("NOW", "-1 days")');
},

};

module.exports = session;
