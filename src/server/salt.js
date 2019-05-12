#!/usr/bin/env node

const crypto = require('crypto');

var so = {

make_salt: function() {
	var val = Buffer.alloc(16);
	crypto.randomFillSync(val);
	salt = val.toString('hex');
	
	return salt;
},

get_salt: async function(database) {
	res = await database.db.get('SELECT `value` AS `salt` FROM `config` WHERE `name` = \'salt\'');
	
	if (res && res.salt) {
		return res.salt;
	}
	
	return undefined;
},

get_or_make_salt: async function(database) {
	salt = this.get_salt(database);
	
	if (!salt) {
		salt = make_salt();
		await set_salt(database, salt);
	}
	
	return salt;
},

// This call is destructive! If called when there is already an existing salt, all user passwords will become invalid during the next login.
// Better to call get_or_make_salt(...) instead.
set_salt: async function(database, salt) {
	try {
		await database.db.run('DELETE FROM `config` WHERE `name` = "salt";');
		await database.db.run('INSERT INTO `config` (`name`, `value`) VALUES ("salt", "' + salt + '");');
	}
	catch (err) {
		throw 'Failed to insert salt into database: ' + err.toString()
	}
}

};

module.exports = so;