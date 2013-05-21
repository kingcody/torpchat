
/**
 * Module dependencies.
 */

var express = require('express')
	, appPaths = require(__dirname + "/" + 'paths.json')
	, routes = require("./"+appPaths.routes).init(appPaths)
	, http = require('http')
	, path = require('path');

var app = express();

app.configure(function(){
	app.set('views', __dirname + "/" + appPaths.views);
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, appPaths.statics)));
	app.use(require('less-middleware')({ src: __dirname + "/" + appPaths.dist }));
	app.use('/' + appPaths.stylesheets, express.static(__dirname + "/" + appPaths.less));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.use(routes.render);

var server = http.createServer(app),
io = require('socket.io').listen(server);

exports = module.exports = server,
// delegates user() function
exports.use = function() {
	app.use.apply(app, arguments);
},
exports.set = function() {
	app.set.apply(app, [arguments[0],arguments[1]]);
};

