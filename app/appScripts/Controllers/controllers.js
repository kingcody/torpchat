/* Controllers */
define(['lodash'], function() {
	var controllers = {};

	controllers.MainCtrl = function($rootScope, $scope, $log, setEqual) {
		
		$rootScope.$log = function (val) {$log.log(val);},
		$rootScope.$size = function (val) {return _.size(val);};
		
		$scope.tcScope = $scope,
		
		$scope.newIrcServer = {
			server: {
				domain: "",
				port: '',
				autoRejoin: false,
				channels: [],
				secure: false,
				selfSigned: false,
				certExpired: false
			},
			torpchat: {
				name: "",
				domains: [],
				autoRejoin: true,
				acceptInvalidCert: false
			}
		};
		$scope.newIrcServer.server.selfSigned = $scope.newIrcServer.torpchat.acceptInvalidCert,
		$scope.newIrcServer.server.certExpired = $scope.newIrcServer.torpchat.acceptInvalidCert;
		
		$scope.newIrcDomain = {
			domain: '',
			port: ''
		};
		
		$scope.ircServerList = {
			'TORPNet': {
				server: {
					autoRejoin: false,
					channels: ["#Linux", "#Milledgeville", "#Reform"],
					secure: true,
					selfSigned: true,
					certExpired: true
				},
				torpchat: {
					name: "TORPNet",
					domains: [
						{
							domain: "irc.torpnet.us",
							port: 6669
						},
						{
							domain: "torp.doesntexist.com",
							port: 6669
						}
					],
					autoRejoin: true,
					acceptInvalidCert: true
				}
			},
			'EFNet': {
				server: {
					autoRejoin: false,
					channels: [],
					secure: false,
					selfSigned: false,
					certExpired: false
				},
				torpchat: {
					name: "EFNet",
					domains: [
						{
							domain: "irc.blackened.com",
							port: 6667
						},
						{
							domain: "irc.Prison.NET",
							port: 6667
						},
						{
							domain: "irc.Qeast.net",
							port: 6667
						},
						{
							domain: "irc.efnet.pl",
							port: 6667
						},
						{
							domain: "efnet.demon.co.uk",
							port: 6667
						},
						{
							domain: "irc.lightning.net",
							port: 6667
						}
					],
					autoRejoin: true,
					acceptInvalidCert: false
				}
			},
			'FreeNode': {
				server: {
					autoRejoin: false,
					channels: [],
					secure: false,
					selfSigned: false,
					certExpired: false
				},
				torpchat: {
					name: "FreeNode",
					domains: [
						{
							domain: "irc.freenode.net",
							port: 6667
						}
					],
					autoRejoin: true,
					acceptInvalidCert: false
				}
			}
		};
		
		$scope.mainMenu = {
			className: "menu-button-1",
			menuNumber: 1,
			text: "TORPChat",
			icon: "icon-torpchat-logo",
			menu: [
				{
					text: "New Client",
					className: "new-client",
					icon: "icon-plus-sign",
					state: "enabled",
					click: '$log()'
				},
				{
					text: "Sign In",
					className: "sign-in",
					icon: "icon-home",
					state: "enabled",
					click: ''
				},
				{
					text: "Exit",
					className: "exit",
					icon: "icon-remove-sign",
					state: "enabled",
					click: ''
				}
			]
		},
		$scope.windowMenus = [
			{
				className: "menu-button-2",
				menuNumber: 2,
				text: "Server",
				icon: "icon-cloud icon-large",
				menu: [
					{
						text: "Server List",
						className: "server-list",
						icon: "icon-sitemap",
						state: "enabled",
						click: 'tcServerList()'
					},
					{
						text: "Connect",
						className: "connect",
						icon: "icon-exchange",
						state: "enabled",
						click: ''
					},
					{
						text: "Disconnect",
						className: "disconnect",
						icon: "icon-ban-circle",
						state: "hidden",
						click: ''
					},
					{
						text: "Reconnect",
						className: "reconnect",
						icon: "icon-retweet",
						state: "disabled",
						click: ''
					},
					{
						text: "Change Nickname",
						className: "change-nickname",
						icon: "icon-edit",
						state: "disabled",
						click: ''
					}
				]
			},
			{
				className: "menu-button-3",
				menuNumber: 3,
				text: "Channel",
				icon: "icon-group icon-large",
				menu: [
					{
						text: "Channel List",
						className: "channel-list",
						icon: "icon-list-alt",
						state: "enabled",
						click: ''
					},
					{
						text: "Join a Channel",
						className: "join-a-channel",
						icon: "icon-signin",
						state: "enabled",
						click: ''
					},
					{
						text: "Multi-Channel Message",
						className: "multi-channel-message",
						icon: "icon-comments-alt",
						state: "enabled",
						click: ''
					}
				]
			},
			{
				className: "menu-button-4",
				menuNumber: 4,
				text: "Settings",
				icon: "icon-cogs icon-large",
				menu: [
					{
						text: "Profile",
						className: "profile",
						icon: "icon-user",
						state: "enabled",
						click: ''
					},
					{
						text: "Preferences",
						className: "preferences",
						icon: "icon-wrench",
						state: "enabled",
						click: ''
					}
				]
			},
			{
				className: "menu-button-5",
				menuNumber: 5,
				text: "Help",
				icon: "icon-question-sign icon-large",
				menu: [
					{
						text: "TORPChat Help",
						className: "torpchat-help",
						icon: "icon-lightbulb",
						state: "enabled",
						click: ''
					},
					{
						text: "About",
						className: "about",
						icon: "icon-info-sign",
						state: "enabled",
						click: ''
					}
				]
			}
		];
		
		$scope.tcWindowButtons = [
			{
				className: "window-button-2",
				icon: "icon-minus-sign icon-large",
				title: "minimize",
				click: ''
			},
			{
				className: "window-button-1",
				icon: "icon-remove-sign icon-large",
				title: "close",
				click: ''
			}
		];
		
		$scope.tcDialogStates = {
			serverEdit: false
		};
		
	};
	
	controllers.ircWindow = function($scope, $rootScope) {
		$scope.windowScope = $scope;
		$scope.windowId = 'TORPChat-'+$scope.$id;
		$scope.tcDialogStates = {
			openDialogs: 0,
			serverList: false
		};
		$scope.selectedServer = $scope.tcScope.ircServerList.TORPNet;
	};

	controllers.ircNavBar = function($scope, $rootScope, tcServerList) {
		$scope.tcServerList = function() {
			tcServerList($scope);
		};
	};
	
	controllers.injected = [
		{
			name: 'tcServerList',
			di: [
				'$scope',
				'tcServerEdit',
				'tcServerDelete',
				'cloneObj'
			],
			fn: function($scope, tcServerEdit, tcServerDelete, cloneObj) {
				$scope.tcServerNew = function() {
					var patternKeys = _.map(_.keys($scope.tcScope.ircServerList), function(val) {
						return val.replace(/ /g,' ( *)');
					}),
					newServerScope = $scope.$new();
					newServerScope.serverListScope = $scope;
					newServerScope.mainScope = newServerScope;
					newServerScope.serverDetails = cloneObj(newServerScope.newIrcServer);
					newServerScope.serverEditName = 'New Connection';
					newServerScope.serverEditTitle = newServerScope.serverEditName;
					newServerScope.serverEditNew = true;
					newServerScope.serverNamePattern = '^(?!( *)'+patternKeys.join('( *)$|( *)')+'( *)$).*'; 
					newServerScope.serverNameRegExp = new RegExp(newServerScope.serverNamePattern); 
					tcServerEdit(newServerScope);
				};
				$scope.tcServerDelete = function() {
					if (typeof($scope.selectedServer) !== 'undefined') {
						var deleteServerScope = $scope.$new();
						tcServerDelete(deleteServerScope);
					}
				};
				$scope.tcServerEdit = function() {
					if (typeof($scope.selectedServer) !== 'undefined') {
						var patternKeys = _.map(_.keys(_.omit($scope.tcScope.ircServerList, $scope.selectedServer.torpchat.name)), function(val) {
							return val.replace(/ /g,' ( *)');
						}),
						editServerScope = $scope.$new();
						editServerScope.serverListScope = $scope;
						editServerScope.mainScope = editServerScope;
						editServerScope.serverDetails = cloneObj(editServerScope.selectedServer);
						editServerScope.serverEditName = editServerScope.serverDetails.torpchat.name;
						editServerScope.serverEditTitle = 'edit '+editServerScope.serverEditName;
						editServerScope.serverEditNew = false;
						editServerScope.$watch('serverDetails.torpchat.name', function(val) {
							editServerScope.serverEditName = editServerScope.serverDetails.torpchat.name;
						});
						editServerScope.serverNamePattern = '^(?!( *)'+patternKeys.join('( *)$|( *)')+'( *)$).*'; 
						editServerScope.serverNameRegExp = new RegExp(editServerScope.serverNamePattern); 
						tcServerEdit(editServerScope);
					}
				};
			}
		},
		{
			name: 'serverEditMain',
			di: [
				'$scope',
				'tcDomainEdit',
				'tcDomainDelete',
				'setEqual',
				'cloneObj'
			],
			fn: function($scope, tcDomainEdit, tcDomainDelete, setEqual, cloneObj) {
				setEqual($scope, 'serverDetails.torpchat.acceptInvalidCert', [
					'serverDetails.server.selfSigned',
					'serverDetails.server.certExpired'
				]);
				
				$scope.mainScope.serverEditScope = $scope;
				$scope.selectedDomain = $scope.serverDetails.torpchat.domains[0];
				$scope.nameSubmitState = {error: false};
				$scope.domainSubmitState = {error: false};
				$scope.$watch('selectedDomain', function() {
					$scope.domainSubmitState = {error: false};
				});
				
				// Setup Move Domains Buttons
				$scope.domainUp = function() {
					var oldIndex = _.indexOf($scope.serverDetails.torpchat.domains, $scope.selectedDomain);
					if (oldIndex > 0) {
						$scope.serverDetails.torpchat.domains.splice(oldIndex--, 0, $scope.serverDetails.torpchat.domains.splice(oldIndex, 1)[0]);
					}
				};
				$scope.domainDown = function() {
					var oldIndex = _.indexOf($scope.serverDetails.torpchat.domains, $scope.selectedDomain);
					if (oldIndex < ($scope.serverDetails.torpchat.domains.length - 1)) {
						$scope.serverDetails.torpchat.domains.splice(oldIndex++, 0, $scope.serverDetails.torpchat.domains.splice(oldIndex, 1)[0]);
					}
				};
				
				// Setup Domain Manipulation Buttons
				$scope.domainAdd = function() {
					var addDomainScope = $scope.$new();
					addDomainScope.serverEditScope = $scope;
					addDomainScope.mainScope = addDomainScope;
					addDomainScope.domainEditTitle = 'New Domain';
					addDomainScope.domainEditNew = true;
					addDomainScope.domainDetails = cloneObj(addDomainScope.newIrcDomain);
					tcDomainEdit(addDomainScope);
				};
				$scope.domainDelete = function() {
					if (typeof($scope.selectedDomain) !== 'undefined') {
						var deleteDomainScope = $scope.$new();
						deleteDomainScope.serverEditScope = $scope;
						tcDomainDelete(deleteDomainScope);
					}
				};
				$scope.domainEdit = function() {
					if (typeof($scope.selectedDomain) !== 'undefined') {
						var editDomainScope = $scope.$new();
						editDomainScope.serverEditScope = $scope;
						editDomainScope.mainScope = editDomainScope;
						editDomainScope.domainEditTitle = 'edit '+editDomainScope.selectedDomain.domain;
						editDomainScope.domainEditNew = false;
						editDomainScope.domainDetails = cloneObj(editDomainScope.selectedDomain);
						tcDomainEdit(editDomainScope);
					}
				};
			}
		},
		{
			name: 'tcDomainEdit',
			di: [
				'$scope'
			],
			fn: function($scope) {
				$scope.mainScope.formScope = $scope;
				$scope.domainSubmitState = {error: false};
				$scope.portSubmitState = {error: false};
			}
		}
	];

	return controllers;
});