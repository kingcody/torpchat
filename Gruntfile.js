'use strict';
var _ = require('underscore');

module.exports = function (grunt) {
	
	// configurable paths
	var yeomanConfig = {
		app: 'app',
		appLess: 'less',
		appScripts: 'appScripts',
		appRoutes: 'appRoutes',
		jadeViews: 'jadeViews',
		jadeScripts: 'jadeScripts',
		customVendor: 'customVendor',
		appStatics: 'static',
		dist: 'dist',
		distScripts: 'scripts',
		distRoutes: 'routes',
		distJade: 'views',
		distStylesheets: 'stylesheets',
		distStatics: 'public',
		distBower: 'vendor',
		bowerComponents: 'components',
		bootstrapLess: 'bootstrap/less',
		bootstrapJS: 'bootstrap/js',
		jqueryUi: 'jquery-ui/ui',
		fontAwesome: 'font-awesome/build/assets/font-awesome',
		express: 'torpchat.js',
		debug: true
	};
	
	// load grunt tasks
	var gruntNpmTasks = [
		'grunt-contrib-jshint',
		'grunt-contrib-clean',
		'grunt-contrib-concat',
		'grunt-contrib-copy',
		'grunt-contrib-imagemin',
		'grunt-contrib-requirejs',
		'grunt-contrib-jade',
		'grunt-contrib-watch',
		'grunt-express'
	];
	_.each(gruntNpmTasks, function(task) {
		grunt.loadNpmTasks(task);
	});
	
	// Client-side Bower packages for requirejs
	var requireBowerJS = {
		'lodash': {
			path: 'lodash/lodash',
			shim: '_'
		},
		'socket-io': {
			path: '../../socket.io/socket.io',
			shim: 'io',
			copy: false
		},
		'angular': {
			path: 'angular/angular',
			shim: 'angular'
		},
		'angular-cookies': {
			path: 'angular-cookies/angular-cookies'
		},
		'angular-mocks': {
			path: 'angular-mocks/angular-mocks'
		},
		'angular-resource': {
			path: 'angular-resource/angular-resource'
		},
		'angular-sanitize': {
			path: 'angular-sanitize/angular-sanitize'
		},
		'jquery': {
			path: 'jquery/jquery'
		},
		'jquery-ui': {
			path: 'jquery-ui/ui/jquery-ui'
		},
		'requirejs': {
			path: 'requirejs/require'
		},
		'modernizr': {
			path: 'modernizr/modernizr'
		}
	};

	/* // load jquery ui scripts into requireBowerJS
	grunt.file.recurse(yeomanConfig.app+'/'+yeomanConfig.bowerComponents+'/'+yeomanConfig.jqueryUi, function(abspath, rootdir, subdir, filename) {
		var fname = filename.split('.');
		if ((rootdir +'/'+ filename) === abspath && fname[0] === 'jquery' && fname[1] === 'ui' && fname.pop() === 'js') {
			requireBowerJS[filename.replace(/\.js/,'')] = {
				path: yeomanConfig.jqueryUi+'/'+filename.replace(/\.js/,'')
			};
		}
	}); */
	
	// load bootstrap scripts into requireBowerJS
	grunt.file.recurse(yeomanConfig.app+'/'+yeomanConfig.bowerComponents+'/'+yeomanConfig.bootstrapJS, function(abspath, rootdir, subdir, filename) {
		var fname = filename.split('.');
		if ((rootdir +'/'+ filename) === abspath && fname.pop() === 'js' && fname[0].split('-')[0] === 'bootstrap') {
			requireBowerJS[filename.replace(/\.js/,'')] = {
				path: yeomanConfig.bootstrapJS+'/'+filename.replace(/\.js/,'')
			};
		}
	});
        
        var copyBuild = {
                statics: {
                        files: [
                                {
                                        expand: true,
                                        cwd:'<%= yeoman.app %>/<%= yeoman.appStatics %>',
                                        src: '**',
                                        dest: '<%= yeoman.dist %>/<%= yeoman.distStatics %>/'
                                }
                        ]
                },
                less: {
                    files: [
                        {
                                expand: true,
                                dot: true,
                                flatten: true,
                                cwd: '<%= yeoman.app %>',
                                dest: '<%= yeoman.dist %>/<%= yeoman.distStylesheets %>',
                                src: [
                                        '<%= yeoman.appLess %>/*.less'
                                ]
                        }
                    ]
                },
                vendorLess: {
                    files: [
                        {
                                expand: true,
                                dot: true,
                                flatten: true,
                                cwd: '<%= yeoman.app %>',
                                dest: '<%= yeoman.dist %>/<%= yeoman.distStylesheets %>',
                                src: [
                                        '<%= yeoman.bowerComponents %>/<%= yeoman.bootstrapLess %>/*.less'
                                ]
                        }
                    ]
                },
				fontAwesomeLess: {
					files: [
						{
							expand: true,
							cwd: '<%= yeoman.app %>/<%= yeoman.bowerComponents %>/<%= yeoman.fontAwesome %>/less',
							dest: '<%= yeoman.dist %>/<%= yeoman.distStylesheets %>/font-awesome/',
							src: [
								'*.less'
							]
						}
					]
				},
				fontAwesome: {
					files: [
						{
							expand: true,
							cwd: '<%= yeoman.app %>/<%= yeoman.bowerComponents %>/<%= yeoman.fontAwesome %>',
							src: 'font/**',
							dest: '<%= yeoman.dist %>/<%= yeoman.distStatics %>'
						}
					]
				},
                routes: {
                    files: [
                        {
                                expand: true,
                                cwd: '<%= yeoman.app %>/<%= yeoman.appRoutes %>',
                                src: '**/*.js',
                                dest: '<%= yeoman.dist %>/<%= yeoman.distRoutes %>/'
                        }
                    ]
                },
                jadeViews: {
                    files: [
                        {
                                expand: true,
                                cwd: '<%= yeoman.app %>/<%= yeoman.jadeViews %>',
                                src: '**/*.jade',
                                dest: '<%= yeoman.dist %>/<%= yeoman.distJade %>/'
                        }
                    ]
                },
                tmp2scripts: {
                    files: [
                            {
                                    expand: true,
                                    cwd: '.tmp',
                                    dest: '<%= yeoman.dist %>/<%= yeoman.distStatics %>/',
                                    src: '<%= yeoman.distScripts %>/**'
                            }

                    ]
                }
        },
        copyBuildAll= {
            files: []
        };
        _.each(copyBuild, function (val, i, l) {
            _.each(l[i].files, function (ele, index, list) {
                copyBuildAll.files[_.size(copyBuildAll.files)] = list[index];
            });
        });
		copyBuild.buildAll = copyBuildAll,
		copyBuild.tmp = {
			files: [
				{
					expand: true,
					cwd: '<%= yeoman.app %>/<%= yeoman.appScripts %>',
					dest: '.tmp/<%= yeoman.distScripts %>/',
					src: '**/*.js'
				}
			]
		},
		copyBuild.tmpCustomVendor = {
			files: [
				{
					expand: true,
					cwd: '<%= yeoman.app %>/<%= yeoman.customVendor %>',
					src: '**',
					dest: '.tmp/<%= yeoman.distScripts %>/<%= yeoman.distBower %>/'
				}
			]
		},
		copyBuild.tmpVendor = {
			files: [
				{
					expand: true,
					cwd: '<%= yeoman.app %>/<%= yeoman.bowerComponents %>',
					dest: '.tmp/<%= yeoman.distScripts %>/<%= yeoman.distBower %>/',
					src: _.map(_.values(requireBowerJS), function (value) {
						
							return  value.path + '*';
					
					})
				}
			]
		};
		
		
	
	var jadeScripts = {},
	jadeList = function (abspath, rootdir, subdir, filename) {
		if (filename.split('.').pop() === "jade") {
			var jsName = filename.replace(".jade", ".js");
			jadeScripts['.tmp/' + yeomanConfig.distScripts + "/" + jsName] = rootdir + '/' + filename;
		}
	};
	
	grunt.file.recurse(yeomanConfig.app + "/" + yeomanConfig.jadeScripts, jadeList);

	grunt.initConfig({
		yeoman: yeomanConfig,
		requireBowerJS: requireBowerJS,
		express: {
			server: {
				options: {
					hostname: 'TORPChat.digitallyseamless.com',
					port: 8677,
					bases: '<%= yeoman.dist %>/<%= yeoman.distStatics %>',
					server: require('path').resolve('<%= yeoman.express %>'),
					debug: '<%= yeoman.debug %>'
				}
			}
		},
		watch: {
                        options: {
                                nospawn: true
                        },
                        jadeViews: {
                                files: ['<%= yeoman.app %>/<%= yeoman.jadeViews %>/**/*.jade'],
                                tasks: ['copy:jadeViews']
                        },
						jadeScripts: {
                                files: ['<%= yeoman.app %>/<%= yeoman.jadeScripts %>/**/*.jade'],
                                tasks: ['jade','copy:tmp2scripts']
                        },
                        appScripts: {
                                files: ['<%= yeoman.app %>/<%= yeoman.appScripts %>/**/*.js'],
                                tasks: ['clean:tmp','copy:tmp','jshint:tmp','copy:tmp2scripts']
                        },
						customVendor: {
                                files: ['<%= yeoman.app %>/<%= yeoman.customVendor %>/**'],
                                tasks: ['clean:tmp','copy:tmpCustomVendor','jshint:tmp','copy:tmp2scripts']
                        },
                        less: {
                                files: ['<%= yeoman.app %>/<%= yeoman.appLess %>/*.less'],
                                tasks: ['copy:less']
                        },
                        routes: {
                                files: ['<%= yeoman.app %>/<%= yeoman.appRoutes %>/*.js'],
                                tasks: ['copy:routes','express-restart']
                        },
                        statics: {
                                files: ['<%= yeoman.app %>/<%= yeoman.appStatics %>/**'],
                                tasks: ['copy:statics']
                        }
		},
		jshint: {
			options: {
				curly: true,
				eqnull: true,
				strict: false,
				globalstrict: true,
				browser: true,
				node: true,
				globals: {
					angular: true,
					define: true,
					require: true,
					$: true,
					_: true
				}
			},
			build: [
				'Gruntfile.js',
				'.tmp/**/*.js',
				'!.tmp/**/*-amd.js'
			],
            tmp: [
				'.tmp/**/*.js',
				'!.tmp/**/*-amd.js'
			]
		},
		clean: {
			dist: ['.tmp', 'paths.json', '<%= yeoman.dist %>/*'],
			tmp: ['.tmp']
		},
		concat: {
			requirejQuery: {
				src: [
					'<%= yeoman.app %>/<%= yeoman.bowerComponents %>/<%= requireBowerJS.requirejs.path %>.js',
					'<%= yeoman.app %>/<%= yeoman.bowerComponents %>/<%= requireBowerJS.jquery.path %>.js'
				],
				dest: '<%= yeoman.app %>/<%= yeoman.bowerComponents %>/<%= requireBowerJS.requirejs.path %>-jquery.js'
			}
		},
		copy: copyBuild,
		jade: {
			requirejs: {
				options: {
					data: {
						_: _,
						baseUrl: '<%= yeoman.distScripts %>/',
						distBower: '<%= yeoman.distBower %>',
						paths : requireBowerJS
					}
				},
				files: jadeScripts
			}
		},
		appPaths: {
                        expressPaths: {
                            options: {
                                    pathFile: "paths.json",
                                    paths: {
                                            dist: '<%= yeoman.dist %>',
                                            routes: '<%= yeoman.dist %>/<%= yeoman.distRoutes %>',
                                            views: '<%= yeoman.dist %>/<%= yeoman.distJade %>',
                                            less: '<%= yeoman.dist %>/<%= yeoman.distStylesheets %>',
                                            statics: '<%= yeoman.dist %>/<%= yeoman.distStatics %>',
                                            stylesheets: '<%= yeoman.distStylesheets %>',
                                            scripts: '<%= yeoman.distScripts %>',
                                            scriptsBower: '<%= yeoman.distBower %>'
                                    }
                            }
                        },
                        bowerConfig: {
                            options: {
                                pathFile: ".bowerrc",
                                paths: {
                                    directory: '<%= yeoman.app %>/<%= yeoman.bowerComponents %>'
                                }
                            }
                        }
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		}
	});
	
	grunt.registerMultiTask('appPaths', 'Writes dist paths to paths.json', function () {
            if (this.data.hasOwnProperty('options')) {
                var options = this.data.options,
                fileData = {},
                newFile = " (new file was created)";
                if (grunt.file.exists(options.pathFile)) {
                    fileData = grunt.file.readJSON(options.pathFile);
                    newFile = " (existing file was updated)";
                }

                _.each(options.paths, function(v, i, l) {
                    fileData[i] = v;
                });
		if (grunt.file.write(options.pathFile, JSON.stringify(fileData, null, 4))) {
			grunt.log.ok("appPaths were successfully written to " + options.pathFile + newFile);
		}
		else {
			grunt.fail.fatal("Could NOT write appPaths to " + options.pathFile);
		}
            }  
	});

	grunt.registerTask('deploy', [
		'express',
		'express-keepalive'
	]);
	
	grunt.registerTask('devel', [
		'express',
		'watch'
	]);
    
	grunt.registerTask('buildCustomComponents', [
		'concat:requirejQuery'
	]);
	
	grunt.registerTask('build', [
        'appPaths:bowerConfig',
		'clean:dist',
		'jade',
		'copy:tmp',
		'copy:tmpCustomVendor',
		'jshint:build',
		'buildCustomComponents',
		'copy:tmpVendor',
		'copy:buildAll',
		'appPaths:expressPaths',
		'clean:tmp'
	]);
	
	grunt.registerTask('default', ['build', 'devel']);
};
