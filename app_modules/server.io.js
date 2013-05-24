exports.use = function(io) {
	var irc = require('irc');
	
	var onConnection = function(socket) {
		
	};
	
	io.sockets.on('connection', function (socket) {
		onConnection(socket);
	});
};