#!/usr/bin/env node

// This file contains routing functionality that gets hooked up elsewhere

// Creates a route object. Used in routing.routes.
function route(path, callback) {
	return {
		path: path,
		callback: callback
	};
}

var routing = {

dbo: null,
server: null,
f_get_user_data: null,

// These don't formally do anything, but can be useful for debugging
routes: {
	no_authenticate: [],
	authenticate: [],
},


init: function(dbo, server, f_get_user_data) {
	this.dbo = dbo;
	this.server = server;
	this.f_get_user_data = f_get_user_data;
},

add_route_authenticate: function(path, callback) {
	this.routes.authenticate.push(route(path, callback);
	
	this.server.route(path, function(err, res) {
		res.user = this.f_get_user_data(res);
		res.dbo = this.dbo;
		callback(err, res);
	}
},
add_route_no_authenticate: function(path, callback) {
	this.routes.no_authenticate.push(route(path, callback);
	
	this.server.route(path, function(err, res) {
		res.user = null;
		res.dbo = this.dbo;
		callback(err, res);
	}
},




}

module.exports = routing;
