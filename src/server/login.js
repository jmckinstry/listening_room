#!/usr/bin/env node

const crypto = require('crypto')

var login = {

// Given a user name, user hash, and nonce for the hash, verify the login attempt
verify_login: async function (db, name, hash, nonce) {
	try {
		var res = db.db.get('SELECT `user_id`, `password` FROM `user` WHERE '
			+ '`name`= "' + name + '"'
			+ ' LIMIT 1'
		);

		if (!res) {
			return false;
		}

		var my_hash = crypto.createHash('sha256').update(res.password + nonce).digest('hex');

		if (my_hash != hash) {
			return false;
		}

		return res.user_id;
	}
        catch (err) {
                console.log(err);
        }

        return false;

},
	
};

module.export = login;
