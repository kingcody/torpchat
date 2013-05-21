define(
    [
	"angular",
	"Services/services",
	"Directives/directives",
	"Filters/filters",
	"Controllers/controllers",
	'underscore'
    ],

    function BaseManager(angular,Services,Directives,Filters,Controllers){
        var initialize = function () {

        var app = angular.module("TORPChat", [], function($routeProvider, $locationProvider) {

            $routeProvider.when('/', {
                templateUrl: '/templates/Main',
                controller: Controllers.MainCtrl
            });

            $routeProvider.otherwise( { redirectTo: '/'} );

            $locationProvider.html5Mode(true);
        });

        Filters.initialize(app);

        app.factory(Services);
        app.directive(Directives);
		_.each(Controllers.injected, function(val) {
			val.di.push(val.fn);
			app.controller(val.name,val.di);
		});

        angular.bootstrap(document,["TORPChat"]);
		
        };
    return {
        initialize : initialize
    };
});