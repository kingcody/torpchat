'use strict';

define(['socket.io'], function(io) {
	var connection = {},
	socket = io.connect('/');
	socket.on('connect', function() {
		console.log('connection via socket.io established');
	});
	
	return connection;
});