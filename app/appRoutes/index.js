
/*
 * GET home page.
 */

var appPaths;

exports.init = function (a) {
	appPaths = a;
	return exports;
};

exports.render = function(req, res, next){
	var reqUrl = req.url.replace(/\//, '');	
	var reqUrl = reqUrl.replace(/\.html/gi, '');	
	var reqUrl = reqUrl.replace(/\.jade/gi, '');	
	console.log(reqUrl);
	
	res.render(reqUrl, { appPaths: appPaths }, function (err, html) {
		if (err || !html) {
			res.status(404);
			res.sendfile(appPaths.statics+'/404.html');
		}
		else {
			res.send(html);
		}
	});
};
