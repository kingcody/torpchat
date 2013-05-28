'use strict';

define(['Controllers/controllers','jquery-ui','bootstrap-dropdown'],function(controllers){

var directives = {};

directives.appVersion = function(version){
    return function(scope, elm, attrs) {
        elm.text(version);
    };
};

directives.ircClient = function() {
	return {
		restrict: 'C',
		scope: true,
		controller: controllers.ircWindow,
		compile: function compile(tElement, tAttrs) {
			return function postLink(scope, iElement, iAttrs) {
				iElement.slideDown(800, function() {
					$(this).draggable({
						appendTo: 'body',
						handle: '.navbar',
						cancel: '.irc-main-nav.navbar.navbar-inverse a'
					})
					.resizable({
						minHeight: 338,
						minWidth: 672,
						handles: 'n,e,s,w,se'
					});
				}); 
			};
		}
	};
};

directives.ircMainNav = function() {
	return {
		restrict: 'C',
		scope: true,
		controller: controllers.ircNavBar
	};
};

directives.tcServerList = function() {
	
};

return directives;
});
