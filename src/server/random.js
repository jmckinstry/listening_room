#!/usr/bin/env node

const crypto = require('crypto');

var random = {

// Given a size in bytes, return a string twice that length in hex-ified random bytes
get_random_hex: function (length) {
	var val = Buffer.alloc(length);
	crypto.randomFillSync(val);
	var result = val.toString('hex');
	
	return result;
},

};

module.exports = random;
