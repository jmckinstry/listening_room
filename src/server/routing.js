#!/usr/bin/env node

// This file contains routing functionality that gets hooked up elsewhere

// This function is used to create response wrappers for unified responses. This way we can always tell the difference between an error and a blank response.
// type:
// - ok : Everything worked as expected
// - error : Something went wrong
//  data:
//  - Whatever was attached. If ok, it's callback's return. If error, it's a generic response (so we don't leak data, check the console log for what actually went wrong).
function make_response(type, data, error) {
	if (type !== 'error' && type !== 'ok') {
		throw 'routing.js:make_response was called with an invalid type';
	}
	
	return {
		type: type,
		data: (type === 'error' ? (error ? error : 'API ERROR') : data)
	};
}

// This function looks up the correct router call given an http request type
// type: See the const for accepted types
// router: The router to get the function of
const types = ['GET', 'POST'];
function get_routing_function(type, router) {
	if (types.indexOf(type) < 0) {
		throw "routing.js: Invalid route type " + type + " specified.";
	}
	
	if (type === 'GET') {
		return router.get;
	}
	if (type === 'POST') {
		return router.post;
	}
}

// All responses are 200 (the server heard you), JSON (no different message types)
function condition_response(reply) {
	reply.code(200).header('Content-Type', 'application/json')
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

add_route_authenticate: function(type, path, callback) {
	if (!this.router) {
		throw "routing.js: routing.init not called before add_route_authenticate()";
	}
	
	get_routing_function(type, this.router)
	.call(this.router, path, async(request, reply) => {
		condition_response(reply)

		try {
			request.user = this.f_get_user_data(request);
			if (!request.user
				|| !request.user.hasOwnProperty('user_id')
				|| !f_get_user_authenticated(request.user.user_id)) {
				throw 'User is not authenticated.';
			}
			
			request.dbo = this.dbo;
			return make_response('ok', callback(request, reply));
		}
		catch (err) {
			console.log('Error during routing: ' + err.toString());
			console.log(err.stack)
			return make_response('error', undefined, err);
		}
	});
},
add_route_no_authenticate: function(type, path, callback) {
	if (!this.router) {
		throw "routing.js: routing.init not called before add_route_no_authenticate()";
	}
	
	get_routing_function(type, this.router)
	.call(this.router, path, async(request, reply) => {
		condition_response(reply)

		try {	
			request.user = null;
			request.dbo = this.dbo;
			return make_response('ok', callback(request, reply));
		}
		catch (err) {
			console.log('Error during routing: ' + err.toString());
			console.log(err.stack)
			return make_response('error');
		}
	});
},




}

module.exports = routing;
