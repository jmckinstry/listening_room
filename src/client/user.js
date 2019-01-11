var user = {
	name:null,	// Readable name
	loginid:null,	// ID specific to user
	token:null,	// This session's access token
	type:null	// The login type ["local", "oauth"]
}

// Reset the user object to defaults
function reset_user() {
	user.name	= null
	user.loginid	= null
	user.token	= null
	user.type	= null
}

// Given a login name and password, hash the password and attempt to log in with it
//
// Returns:
// 	Error	- inputs were invalid
// 	false	- login attempt failed
// 	true	- login attempt succeeded and user is set up
function do_login(name, pass) {
	if (typeof(name) !== "string") {
		throw new Error("NAME_INVALID")
	}
	if (typeof(pass) !== "string") {
		throw new Error("PASS_INVALID")
	}
	if (name.length < config.login_name_min_length) {
		throw new Error("NAME_TOO_SHORT")
	}
	if (pass.length < config.login_pass_min_length) {
		throw new Error("PASS_TOO_SHORT")
	}
	
	var b_pass = new buffer.SlowBuffer(pass.normalize('NFKC'));
	var b_salt = new buffer.SlowBuffer(config.salt.normalize('NFKC'));

	var hash_vals = {
		N: 4096,
		r: 16,
		p: 2,
		dkLen: 32
	};
	
	scrypt(b_pass, b_salt, hash_vals.N, hash_vals.r, hash_vals.p, hash_vals.dkLen, function(error, progress, hash) {
		if (error) {
			throw new Error("HASH_FAILED: " + error)
		}
		else if (!hash) {
			return;
		} else {
			hash = (new buffer.SlowBuffer(hash)).toString('hex');

			// Strong check that password hashing is at least a little reasonable
			if (typeof(hash) !== "string"
				|| hash.length < 16
				|| hash == pass) {
				throw new Error("HASH_SUSPICIOUS")
			}

			// Made it far enough, toss name and hash to server and see if we're good
			$.ajax("/api/login", {
				type:"POST",
				data:{
					name:name,
					hash:hash
				}
			})
			.done(function(data, textResponse) {
				reset_user()
				
				if (data.type === "ok") {
					user.name	= name
					user.loginid	= data.loginid
					user.token	= data.token
					user.type	= "local"

					return true
				}
				else {
					throw new Error("Login failed.");
				}
			})
			.fail(function(jqXHR, textResponse, error) {
				reset_user()

				return false
			})
		}
	});
}

// Handle pop-ups and whatnot for OAuth login
//
// Returns:
// 	false	- login failed or was cancelled
// 	true	- login succeeded and user is set up
function do_oauth_login() {
	console.log("user.js::do_oauth_login is not implemented")

	return false
}

// Given a user object, make sure this user is authorized
//
// Returns:
// 	Error	- the user object was invalid
// 	false	- the given credentials failed
// 	true	- the given credentials are valid
function verify_login() {
	if (user.name === null
		|| user.loginid === null) {
		return false
	}
}
