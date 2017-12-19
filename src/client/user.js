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
		return new Error("NAME_INVALID")
	}
	if (typeof(pass) !== "string") {
		return new Error("PASS_INVALID")
	}
	if (name.length < _GLOBAL.login_name_min_length) {
		return new Error("NAME_TOO_SHORT")
	}
	if (pass.length < _GLOBAL.login_pass_min_length) {
		return new Error("PASS_TOO_SHORT")
	}

	// Strong check that password hashing is in and configured
	if (typeof(_GLOBAL.hash_function !== "function")) {
		return new Error("HASH_FUNCTION")
	}

	var hash = _GLOBAL.hash_function(pass)

	// Strong check that password hashing is at least a little reasonable
	if (typeof(hash) !== "string"
		|| hash.length < 16
		|| hash == pass) {
		return new Error("HASH_SUSPICIOUS")
	}

	// Made it far enough, toss name and hash to server and see if we're good
	$.ajax("api/login", {
		type:"POST",
		data:{
			name:name,
			hash:hash
		}
	})
		.done(function(data, textResponse) {
			reset_user()

			user.name	= name
			user.loginid	= data.loginid
			user.token	= data.token
			user.type	= "local"

			return true
	})	.fail(function(jqXHR, textResponse, error) {
			reset_user()

			return false
	})
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
