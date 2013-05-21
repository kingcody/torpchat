'use strict';

/* Filters */
define(['underscore'],function() {

    function initialize(app) {
		app.filter(('interpolate'),function(version){
			return function(text) {
				return String(text).replace(/\%VERSION\%/mg, version);
			};
		});
		app.filter(('size'), function($log) {
			return function(obj, limitType, limit) {
				var size = _.size(obj);
				if (limitType && limit) {
					limit = parseInt(limit, 10);
					size = parseInt(size, 10);
					if ((limitType === 'max' && size > limit) || (limitType === 'min' && size < limit)) {
						size = limit;
					}
				}
				$log.log(size);
				return size;
			};
		});
    }

    return {initialize : initialize};
});
