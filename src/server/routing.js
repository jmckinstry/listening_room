#!/usr/bin/env node

// This file contains routing functionality that gets hooked up elsewhere

// This function is used to create response wrappers for unified responses. This way we can always tell the difference between an error and a blank response.
// Types:
// - ok : Everything worked as expected
// - error : Something went wrong
//  Data:
//  - Whatever was attached. If ok, it's callback's return. If error, it's a generic response (so we don't leak data, check the console log for what actually went wrong).
function make_response(type, data) {
	if (type !== 'error' && type !== 'ok') {
		throw 'routing.js:make_response was called with an invalid type';
	}
	
	return {
		type: type,
		data: (type === 'error' ? 'API ERROR' : data)
	};
}


var routing = {

// A handle to the web server router.
router: null,
// A handle to the database object. Passed into each route automatically.
dbo: null,
// (request_data): returns an object representing the connecting user. Only called in authenticated routes. Passed into each route automatically.
f_get_user_data: null,
// (user.user_id): returns true if the user's allowed to sign in (has a valid session), false otherwise. If not provided, all sessions are allowed to route.
f_get_user_authenticated: function() {return true;},



init: function(router, dbo, f_get_user_data, f_get_user_authenticated) {
	if (!router || !f_get_user_data || !f_get_user_data) {
		throw "routing.js:init() not called correctly";
	}
	
	this.router = router;
	this.dbo = dbo;
	this.f_get_user_data = f_get_user_data;
	this.f_get_user_authenticated = f_get_user_authenticated;
},

add_route_authenticate: function(path, callback) {
	if (!this.router) {
		throw "routing.js: routing.init not called before add_route_authenticate()";
	}
	
	this.router.get(path, async(request, reply) => {
		try {
			request.user = this.f_get_user_data(request);
			if (!request.user
				|| !request.user.hasOwnProperty('user_id')
				|| !f_get_user_authenticated(request.user.user_id)) {
				throw 'User is not allowed to connect.';
			}
			
			request.dbo = this.dbo;
			return make_response('ok', callback(request, reply));
		}
		catch (err) {
			console.trace('Error during routing: ' + err.toString());
			return make_response('error');
		}
	});
},
add_route_no_authenticate: function(path, callback) {
	if (!this.router) {
		throw "routing.js: routing.init not called before add_route_no_authenticate()";
	}
	
	this.router.get(path, async(request, reply) => {
		try {
			request.user = null;
			request.dbo = this.dbo;
			return make_response('ok', callback(request, reply));
		}
		catch (err) {
			console.trace('Error during routing: ' + err.toString());
			return make_response('error');
		}
	});
},




}

module.exports = routing;
