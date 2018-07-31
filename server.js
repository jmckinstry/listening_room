#!/usr/bin/env node

var config = require('config');
var args = require('args');
var https = require('https');

var ws_server = require('websocket').server;
var ws_router = require('websocket').router;


// Handle Config and Args first

