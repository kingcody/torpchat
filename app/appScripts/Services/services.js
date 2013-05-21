'use strict';

/* Services */

define(['jquery-ui', 'lodash'], function() {

	// TORPChat Dialog extends the jquery-ui dialog widget. 
	// ----------------------------------------------------
	$.widget("custom.tcdialog", $.ui.dialog, {
		options: {
			appendTo: "body",
			autoOpen: true,
			buttons: [],
			closeOnEscape: true,
			closeText: "close",
			dialogClass: "",
			draggable: true,
			hide: null,
			height: "auto",
			maxHeight: null,
			maxWidth: null,
			minHeight: 150,
			minWidth: 150,
			modal: false,
			position: {
				my: "center",
				at: "center",
				of: window,
				collision: "fit",
				// Ensure the titlebar is always visible
				using: function(pos) {
					var topOffset = $(this).css(pos).offset().top;
					if (topOffset < 0) {
						$(this).css("top", pos.top - topOffset);
					}
				}
			},
			resizable: true,
			show: null,
			title: null,
			width: 300,
			// callbacks
			beforeClose: null,
			close: null,
			drag: null,
			dragStart: null,
			dragStop: null,
			focus: null,
			open: null,
			resize: null,
			resizeStart: null,
			resizeStop: null
		},
		_create: function() {
			this.originalCss = {
				display: this.element[0].style.display,
				width: this.element[0].style.width,
				minHeight: this.element[0].style.minHeight,
				maxHeight: this.element[0].style.maxHeight,
				height: this.element[0].style.height
			};
			this.originalPosition = {
				parent: this.element.parent(),
				index: this.element.parent().children().index(this.element)
			};
			this.originalTitle = this.element.attr("title");
			this.options.title = this.options.title || this.originalTitle;

			this._createWrapper();

			this.element
					.show()
					.removeAttr("title")
					.addClass("ui-dialog-content ui-widget-content")
					.appendTo(this.uiDialog);

			this._createTitlebar();
			this._createButtonPane();

			if (this.options.draggable && $.fn.draggable) {
				this._makeDraggable();
			}
			if (this.options.resizable && $.fn.resizable) {
				this._makeResizable();
			}

			this._isOpen = false;
		},
		_init: function() {
			if (this.options.autoOpen) {
				this.open();
			}
		},
		_appendTo: function() {
			var element = this.options.appendTo;
			if (element && (element.jquery || element.nodeType)) {
				return $(element);
			}
			return this.document.find(element || "body").eq(0);
		},
		_destroy: function() {
			var next,
					originalPosition = this.originalPosition;

			this._destroyOverlay();

			this.element
					.removeUniqueId()
					.removeClass("ui-dialog-content ui-widget-content")
					.css(this.originalCss)
					// Without detaching first, the following becomes really slow
					.detach();

			this.uiDialog.stop(true, true).remove();

			if (this.originalTitle) {
				this.element.attr("title", this.originalTitle);
			}

			next = originalPosition.parent.children().eq(originalPosition.index);
			// Don't try to place the dialog next to itself (#8613)
			if (next.length && next[0] !== this.element[0]) {
				next.before(this.element);
			} else {
				originalPosition.parent.append(this.element);
			}
		},
		_createWrapper: function() {
			this.uiDialog = $("<div>")
					.addClass("ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " +
					this.options.dialogClass)
					.hide()
					.attr({
				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			})
					.appendTo(this._appendTo());

			this._on(this.uiDialog, {
				keydown: function(event) {
					if (this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
							event.keyCode === $.ui.keyCode.ESCAPE) {
						event.preventDefault();
						this.close(event);
						return;
					}

					// prevent tabbing out of dialogs
					if (event.keyCode !== $.ui.keyCode.TAB) {
						return;
					}
					var tabbables = this.uiDialog.find(":tabbable"),
							first = tabbables.filter(":first"),
							last = tabbables.filter(":last");

					if ((event.target === last[0] || event.target === this.uiDialog[0]) && !event.shiftKey) {
						first.focus(1);
						event.preventDefault();
					} else if ((event.target === first[0] || event.target === this.uiDialog[0]) && event.shiftKey) {
						last.focus(1);
						event.preventDefault();
					}
				},
				mousedown: function(event) {
					if (this._moveToTop(event)) {
						this._focusTabbable();
					}
				}
			});

			// We assume that any existing aria-describedby attribute means
			// that the dialog content is marked up properly
			// otherwise we brute force the content as the description
			if (!this.element.find("[aria-describedby]").length) {
				this.uiDialog.attr({
					"aria-describedby": this.element.uniqueId().attr("id")
				});
			}
		},
		_createTitlebar: function() {
			var uiDialogTitle,
					tcDialog = this.uiDialog;


			this.uiDialogTitlebar = $("<div>")
					.addClass("navbar-inner")
					.appendTo(
					$("<div>")
					.addClass("navbar navbar-inverse")
					.prependTo(tcDialog)
					);
			this._on(this.uiDialogTitlebar, {
				mousedown: function(event) {
					// Don't prevent click on close button (#8838)
					// Focusing a dialog that is partially scrolled out of view
					// causes the browser to scroll it into view, preventing the click event
					if (!$(event.target).closest(".ui-dialog-titlebar-close")) {
						// Dialog isn't getting focus when dragging (#8063)
						this.uiDialog.focus();
					}
				}
			});

			this.uiDialogTitlebarClose = $("<a></a>", {title: "close", "class": "ui-dialog-titlebar-close"})
					.addClass("window-button-1")
					.appendTo(
					$("<li></li>").appendTo(
					$("<ul></ul>", {"class": "nav pull-right"}).appendTo(this.uiDialogTitlebar)
					)
					)
					.append(
					$("<i></i>", {"class": "icon-remove-sign icon-large"})
					);
			this._on(this.uiDialogTitlebarClose, {
				click: function(event) {
					event.preventDefault();
					if (!tcDialog.hasClass("ui-state-disabled")) {
						this.close(event);
					}
					else {
						this.close(event);
					}
				}
			});

			uiDialogTitle = $("<span>")
					.uniqueId()
					.addClass("brand")
					.appendTo(
					$("<div></div>", {"class": "text-center"})
					.prependTo(this.uiDialogTitlebar)
					);
			this._title(uiDialogTitle);

			this.uiDialog.attr({
				"aria-labelledby": uiDialogTitle.attr("id")
			});
		},
		_title: function(title) {
			if (!this.options.title) {
				title.html("&#160;");
			}
			title.text(this.options.title);
		},
		_createButtonPane: function() {
			this.uiDialogButtonPane = $("<div>")
					.addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix");

			this.uiButtonSet = $("<div>")
					.addClass("ui-dialog-buttonset")
					.appendTo(this.uiDialogButtonPane);

			this._createButtons();
		},
		_createButtons: function() {
			var that = this,
					buttons = this.options.buttons;

			// if we already have a button pane, remove it
			this.uiDialogButtonPane.remove();
			this.uiButtonSet.empty();

			if ($.isEmptyObject(buttons) || ($.isArray(buttons) && !buttons.length)) {
				this.uiDialog.removeClass("ui-dialog-buttons");
				return;
			}

			$.each(buttons, function(name, props) {
				var click, buttonOptions;
				props = $.isFunction(props) ?
						{click: props, text: name} :
						props;
				// Default to a non-submitting button
				props = $.extend({type: "button"}, props);
				// Change the context for the click callback to be the main element
				click = props.click;
				props.click = function() {
					click.apply(that.element[0], arguments);
				};
				buttonOptions = {
					icons: props.icons,
					text: props.showText
				};
				delete props.icons;
				delete props.showText;
				$("<button></button>", props)

						.appendTo(that.uiButtonSet);
			});
			this.uiDialog.addClass("ui-dialog-buttons");
			this.uiDialogButtonPane.appendTo(this.uiDialog);
		},
		_makeDraggable: function() {
			var that = this,
					options = this.options;

			function filteredUi(ui) {
				return {
					position: ui.position,
					offset: ui.offset
				};
			}

			this.uiDialog.draggable({
				cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
				handle: ".ui-dialog-titlebar, .navbar",
				containment: "document",
				start: function(event, ui) {
					$(this).addClass("ui-dialog-dragging");
					that._blockFrames();
					that._trigger("dragStart", event, filteredUi(ui));
				},
				drag: function(event, ui) {
					that._trigger("drag", event, filteredUi(ui));
				},
				stop: function(event, ui) {
					options.position = [
						ui.position.left - that.document.scrollLeft(),
						ui.position.top - that.document.scrollTop()
					];
					$(this).removeClass("ui-dialog-dragging");
					that._unblockFrames();
					that._trigger("dragStop", event, filteredUi(ui));
				}
			});
		},
		_makeResizable: function() {
			var that = this,
					options = this.options,
					handles = options.resizable,
					// .ui-resizable has position: relative defined in the stylesheet
					// but dialogs have to use absolute or fixed positioning
					position = this.uiDialog.css("position"),
					resizeHandles = typeof handles === "string" ?
					handles :
					"n,e,s,w,se,sw,ne,nw";

			function filteredUi(ui) {
				return {
					originalPosition: ui.originalPosition,
					originalSize: ui.originalSize,
					position: ui.position,
					size: ui.size
				};
			}

			this.uiDialog.resizable({
				cancel: ".ui-dialog-content",
				containment: "document",
				alsoResize: this.element,
				maxWidth: options.maxWidth,
				maxHeight: options.maxHeight,
				minWidth: options.minWidth,
				minHeight: this._minHeight(),
				handles: resizeHandles,
				start: function(event, ui) {
					$(this).addClass("ui-dialog-resizing");
					that._blockFrames();
					that._trigger("resizeStart", event, filteredUi(ui));
				},
				resize: function(event, ui) {
					that._trigger("resize", event, filteredUi(ui));
				},
				stop: function(event, ui) {
					options.height = $(this).height();
					options.width = $(this).width();
					$(this).removeClass("ui-dialog-resizing");
					that._unblockFrames();
					that._trigger("resizeStop", event, filteredUi(ui));
				},
				create: function() {
					$(this).children('.ui-icon-gripsmall-diagonal-se').addClass('icon-double-angle-right');
				}
			})
					.css("position", position);
		},
		disable: function() {
			this.uiDialog.addClass("ui-state-disabled").find("button,select,form,input,radio,checkbox").attr("disabled", "disabled");
			var atags = this.uiDialog.find("a");
			atags.each(function(i, e) {
				var parele = $(e).parent(),
						fake = $(e).clone().addClass("ui-state-temp");
				$(e).data("style", [$(e).attr("style")])
						.attr("style", "").hide();
				fake.appendTo(parele);
			});
		},
		enable: function() {
			this.uiDialog.removeClass("ui-state-disabled").find("button,select,form,input,radio,checkbox").removeAttr("disabled");
			var atags = this.uiDialog.find("a:not(.ui-state-temp)");
			atags.each(function(i, e) {
				var temp = $(e).siblings(".ui-state-temp");
				temp.remove();
				$(e).attr("style", $(e).data("style"));
			});
		}
	});
	// END TORPChat Dialog


	/*
	 * Angular Services
	 * ----------------
	 */

	var services = {};


	// Get Template function gets a template from a url and returns it; caching it for future returns.
	services.getTemplate = function($http, $q, $templateCache) {
		var getTemplate = function(url, callback) {
			return $q.when($templateCache.get(url) || $http.get(url, {cache: true}).then(function(res) {
				return res.data;
			})).then(function onSuccess(template) {
				return callback(template);
			});
		};
		return getTemplate;
	};

	services.setEqual = function() {
		var setEqual = function setEqual(scope, toWatch, toSet) {
			scope.$watch(toWatch, function(val) {
				_.each(toSet, function(set) {
					/* jshint evil: true */

					set = set.replace(/[\(\)\[\]'";-]/g, '');
					set = set.replace(/\./g, "']['");

					eval("scope['" + set + "'] = val");
				});
			});
		};

		return setEqual;
	};

	// Returns an exact copy of a serverDetails object that was passed in.
	services.cloneObj = function() {
		/*
		 * Deepcopy function. Borrowed from http://oranlooney.com/deep-copy-javascript/
		 * ----------------------------------------------------------------------------
		 */

		// the re-usable constructor function used by clone().
		function Clone() {
		}

		// clone objects, skip other types.
		function clone(target) {
			if (typeof target === 'object') {
				Clone.prototype = target;
				return new Clone();
			} else {
				return target;
			}
		}

		// Deep Copy
		var deepCopiers = [];

		function DeepCopier(config) {
			for (var key in config) {
				this[key] = config[key];
			}
		}
		DeepCopier.prototype = {
			constructor: DeepCopier,
			// determines if this DeepCopier can handle the given object.
			canCopy: function(source) {
				return false;
			},
			// starts the deep copying process by creating the copy object.  You
			// can initialize any properties you want, but you can't call recursively
			// into the DeeopCopyAlgorithm.
			create: function(source) {
			},
			// Completes the deep copy of the source object by populating any properties
			// that need to be recursively deep copied.  You can do this by using the
			// provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
			// cyclic references for objects already deepCopied, including the source object
			// itself.  The "result" passed in is the object returned from create().
			populate: function(deepCopyAlgorithm, source, result) {
			}
		};

		function DeepCopyAlgorithm() {
			// copiedObjects keeps track of objects already copied by this
			// deepCopy operation, so we can correctly handle cyclic references.
			this.copiedObjects = [];
			var thisPass = this;
			this.recursiveDeepCopy = function(source) {
				return thisPass.deepCopy(source);
			};
			this.depth = 0;
		}
		DeepCopyAlgorithm.prototype = {
			constructor: DeepCopyAlgorithm,
			maxDepth: 256,
			// add an object to the cache.  No attempt is made to filter duplicates;
			// we always check getCachedResult() before calling it.
			cacheResult: function(source, result) {
				this.copiedObjects.push([source, result]);
			},
			// Returns the cached copy of a given object, or undefined if it's an
			// object we haven't seen before.
			getCachedResult: function(source) {
				var copiedObjects = this.copiedObjects;
				var length = copiedObjects.length;
				for (var i = 0; i < length; i++) {
					if (copiedObjects[i][0] === source) {
						return copiedObjects[i][1];
					}
				}
				return undefined;
			},
			// deepCopy handles the simple cases itself: non-objects and object's we've seen before.
			// For complex cases, it first identifies an appropriate DeepCopier, then calls
			// applyDeepCopier() to delegate the details of copying the object to that DeepCopier.
			deepCopy: function(source) {
				// null is a special case: it's the only value of type 'object' without properties.
				if (source === null) {
					return null;
				}

				// All non-objects use value semantics and don't need explict copying.
				if (typeof source !== 'object') {
					return source;
				}

				var cachedResult = this.getCachedResult(source);

				// we've already seen this object during this deep copy operation
				// so can immediately return the result.  This preserves the cyclic
				// reference structure and protects us from infinite recursion.
				if (cachedResult) {
					return cachedResult;
				}

				// objects may need special handling depending on their class.  There is
				// a class of handlers call "DeepCopiers"  that know how to copy certain
				// objects.  There is also a final, generic deep copier that can handle any object.
				for (var i = 0; i < deepCopiers.length; i++) {
					var deepCopier = deepCopiers[i];
					if (deepCopier.canCopy(source)) {
						return this.applyDeepCopier(deepCopier, source);
					}
				}
				// the generic copier can handle anything, so we should never reach this line.
				throw new Error("no DeepCopier is able to copy " + source);
			},
			// once we've identified which DeepCopier to use, we need to call it in a very
			// particular order: create, cache, populate.  This is the key to detecting cycles.
			// We also keep track of recursion depth when calling the potentially recursive
			// populate(): this is a fail-fast to prevent an infinite loop from consuming all
			// available memory and crashing or slowing down the browser.
			applyDeepCopier: function(deepCopier, source) {
				// Start by creating a stub object that represents the copy.
				var result = deepCopier.create(source);

				// we now know the deep copy of source should always be result, so if we encounter
				// source again during this deep copy we can immediately use result instead of
				// descending into it recursively.  
				this.cacheResult(source, result);

				// only DeepCopier::populate() can recursively deep copy.  So, to keep track
				// of recursion depth, we increment this shared counter before calling it,
				// and decrement it afterwards.
				this.depth++;
				if (this.depth > this.maxDepth) {
					throw new Error("Exceeded max recursion depth in deep copy.");
				}

				// It's now safe to let the deepCopier recursively deep copy its properties.
				deepCopier.populate(this.recursiveDeepCopy, source, result);

				this.depth--;

				return result;
			}
		};

		// entry point for deep copy.
		//   source is the object to be deep copied.
		//   maxDepth is an optional recursion limit. Defaults to 256.
		function deepCopy(source, maxDepth) {
			var deepCopyAlgorithm = new DeepCopyAlgorithm();
			if (maxDepth) {
				deepCopyAlgorithm.maxDepth = maxDepth;
			}
			return deepCopyAlgorithm.deepCopy(source);
		}

		// publicly expose the DeepCopier class.
		deepCopy.DeepCopier = DeepCopier;

		// publicly expose the list of deepCopiers.
		deepCopy.deepCopiers = deepCopiers;

		// make deepCopy() extensible by allowing others to 
		// register their own custom DeepCopiers.
		deepCopy.register = function(deepCopier) {
			if (!(deepCopier instanceof DeepCopier)) {
				deepCopier = new DeepCopier(deepCopier);
			}
			deepCopiers.unshift(deepCopier);
		};

		// Generic Object copier
		// the ultimate fallback DeepCopier, which tries to handle the generic case.  This
		// should work for base Objects and many user-defined classes.
		deepCopy.register({
			canCopy: function(source) {
				return true;
			},
			create: function(source) {
				if (source instanceof source.constructor) {
					return clone(source.constructor.prototype);
				} else {
					return {};
				}
			},
			populate: function(deepCopy, source, result) {
				for (var key in source) {
					if (source.hasOwnProperty(key)) {
						result[key] = deepCopy(source[key]);
					}
				}
				return result;
			}
		});

		// Array copier
		deepCopy.register({
			canCopy: function(source) {
				return (source instanceof Array);
			},
			create: function(source) {
				return new source.constructor();
			},
			populate: function(deepCopy, source, result) {
				for (var i = 0; i < source.length; i++) {
					result.push(deepCopy(source[i]));
				}
				return result;
			}
		});

		// Date copier
		deepCopy.register({
			canCopy: function(source) {
				return (source instanceof Date);
			},
			create: function(source) {
				return new Date(source);
			}
		});

		// HTML DOM Node

		// utility function to detect Nodes.  In particular, we're looking
		// for the cloneNode method.  The global document is also defined to
		// be a Node, but is a special case in many ways.
		function isNode(source) {
			if (window.Node) {
				return source instanceof Node;
			} else {
				// the document is a special Node and doesn't have many of
				// the common properties so we use an identity check instead.
				if (source === document) {
					return true;
				}
				return (
						typeof source.nodeType === 'number' &&
						source.attributes &&
						source.childNodes &&
						source.cloneNode
						);
			}
		}

		// Node copier
		deepCopy.register({
			canCopy: function(source) {
				return isNode(source);
			},
			create: function(source) {
				// there can only be one (document).
				if (source === document) {
					return document;
				}

				// start with a shallow copy.  We'll handle the deep copy of
				// its children ourselves.
				return source.cloneNode(false);
			},
			populate: function(deepCopy, source, result) {
				// we're not copying the global document, so don't have to populate it either.
				if (source === document) {
					return document;
				}

				// if this Node has children, deep copy them one-by-one.
				if (source.childNodes && source.childNodes.length) {
					for (var i = 0; i < source.childNodes.length; i++) {
						var childCopy = deepCopy(source.childNodes[i]);
						result.appendChild(childCopy);
					}
				}
			}
		});


		var cloneObj = function cloneObj(serverDetails) {
			return deepCopy(serverDetails);
		};

		return cloneObj;
	};

	// Enable or Disable Window Menus per TORPChat window
	services.tcMenuControl = function() {
		return function(scope, set) {
			var windowId = scope.windowScope.windowId;
			if (set === 'disable') {
				$('#' + windowId + ' .irc-main-nav a.dropdown-toggle').attr('data-toggle', '')
						.parent().removeClass('open');
			}
			else if (set === 'enable') {
				$('#' + windowId + ' .irc-main-nav a.dropdown-toggle').attr('data-toggle', 'dropdown');
			}
		};
	};

	// Called whenever a window's dialogs are opened or closed. Calls tcMenuControl to enable/disable accordingly.
	services.tcDialogCount = function(tcMenuControl) {
		return function(action, scope) {
			if (action === 'add') {
				scope.windowScope.tcDialogStates.openDialogs += 1;
				tcMenuControl(scope, 'disable');
			}
			else if (action === 'del') {
				if (scope.windowScope.tcDialogStates.openDialogs > 0) {
					scope.windowScope.tcDialogStates.openDialogs -= 1;
					if (scope.windowScope.tcDialogStates.openDialogs === 0) {
						tcMenuControl(scope, 'enable');
					}
				}
			}
		};
	};

	// This is the Angular service that wraps the jquery-ui tcdialog widget. All options are passed via an angular scope, used to compile.
	services.tcDialog = function($compile, getTemplate, tcDialogCount) {

		var createTcDialog = function(elem, scope) {
			var tcOpen = scope.tcDialogOptions.open || function() {
			};
			scope.tcDialogOptions.open = function() {
				tcOpen.apply(this, arguments);
				tcDialogCount('add', scope);
			};
			var tcClose = scope.tcDialogOptions.close || function() {
			};
			scope.tcDialogOptions.close = function() {
				tcClose.apply(this, arguments);
				tcDialogCount('del', scope);
			};

			return $compile(elem.tcdialog(scope.tcDialogOptions).tcdialog('widget'))(scope);
		};

		var tcDialog = function tcDialog(scope) {
			var elem = $("<div>", scope.tcDialogOptions.attrs);
			if (scope.tcDialogOptions.template) {
				elem.html(scope.tcDialogOptions.template);
				return createTcDialog(elem, scope);
			}
			else if (scope.tcDialogOptions.templateUrl) {
				return getTemplate(scope.tcDialogOptions.templateUrl, function(template) {
					elem.html(template);
					return createTcDialog(elem, scope);
				});
			}
		};
		return tcDialog;
	};
	
	// Open a simple, alert style dialog box. This is a simple wrapper for the tcDialog service.
	services.tcAlert = function(tcDialog) {
		var alertDialog = function(scope) {
			var btnClass = 'btn';
			if (scope.tcAlert.buttonClass) {
				btnClass += ' ' + scope.tcAlert.buttonClass;
			}
			scope.tcDialogOptions = {
				template: '<p class="text-center">'+scope.tcAlert.message+'</p>',
				attrs: {
					title: scope.tcAlert.title,
					style: 'display: none;'
				},
				draggable: true,
				resizable: false,
				modal: true,
				buttons: [
					{
						text: "Ok",
						"class": btnClass,
						tabindex: -1,
						click: function() {
							$(this).tcdialog('close');
						}
					}
				],
				open: function(event, ui) {
					if (typeof(scope.tcAlert.open) === 'function') {
						scope.tcAlert.open.apply(this, arguments);
					}
					
				},
				close: function(event, ui) {
					if (typeof(scope.tcAlert.close) === 'function') {
						scope.tcAlert.close.apply(this, arguments);
					}
					$(this).scope().$destroy();
					$(this).remove();
				}
			};
			
			return tcDialog(scope);
		};
		
		return alertDialog;
	};


	// Sever List Functions
	// --------------------

	// Opens a server list for a particular window; creating it if it has not been already.
	services.tcServerList = function(tcDialog) {

		var openServerList = function openServerList(scope) {
			if (!scope.windowScope.tcDialogStates.serverList) {
				var serverListId = 'tcServerList' + scope.$id;
				scope.tcDialogOptions = {
					templateUrl: '/templates/ServerList',
					attrs: {
						title: 'TORPChat - Server List',
						style: 'display: none;',
						id: serverListId
					},
					draggable: true,
					resizable: true,
					width: 424,
					height: 272,
					minWidth: 316,
					minHeight: 212,
					buttons: [
						{
							text: "Connect",
							title: "connect to selected server",
							"class": "btn btn-primary pull-right",
							click: function() {

							}
						},
						{
							text: "Close",
							"class": "btn pull-left",
							click: function() {
								$(this).tcdialog("close");
							}
						}
					],
					create: function() {
						scope.windowScope.tcDialogStates.serverList = serverListId;
					}
				};
				return tcDialog(scope);

			}
			else {
				return $('#' + scope.windowScope.tcDialogStates.serverList).tcdialog('open');
			}
		};
		return openServerList;
	};
	
	// Opens a Server Edit window, for new connections and existing
	services.tcServerEdit = function(tcDialog, tcAlert, cloneObj) {

		var newEditServer = function newEditServer(scope) {
			var validateFn = function(that) {
				if (scope.serverEditScope.serverNameForm.serverName.$valid && typeof(scope.serverEditScope.selectedDomain) !== 'undefined') {
					return true;
				}
				else {
					if(!scope.serverEditScope.serverNameForm.serverName.$valid) {
						scope.serverEditScope.nameSubmitState.error = true;
						var alertMessage = 'Irc connection must have a name!';
						if (typeof(scope.serverEditScope.serverNameForm.serverName.$viewValue) !== 'undefined' && scope.serverEditScope.serverNameForm.serverName.$viewValue !== '') {
							var name = scope.serverEditScope.serverNameForm.serverName.$viewValue.replace(/  ( *)/g,' ');
							alertMessage = 'Sorry, but '+name+' is already in use.';
						}
						var alertScope = scope.$new();
						alertScope.tcAlert = {
							title: 'Invalid Server Name',
							message: alertMessage,
							buttonClass: 'btn-danger',
							close: function() {
								$(that).find('.error').first().find('input').focus();
							}
						};
						tcAlert(alertScope);
					}
					else if (typeof(scope.serverEditScope.selectedDomain) === 'undefined') {
						scope.serverEditScope.domainSubmitState.error = true;
						var alertScope2 = scope.$new();
						alertScope2.tcAlert = {
							title: 'Invalid Domain List',
							message: 'Irc connection must have at least one domain!',
							buttonClass: 'btn-danger',
							close: function() {
								$(that).find('.error').first().find('select').focus();
							}
						};
						tcAlert(alertScope2);
					}
					scope.serverEditScope.$digest();
					return false;
				}
			},
			saveFn = function(that) {
				if (validateFn(that)) {
					var editServerName = scope.serverEditScope.serverDetails.torpchat.name.replace(/  ( *)/g,' ');
					scope.tcScope.$apply(function($scope) {
						scope.serverEditScope.serverDetails.torpchat.name = editServerName;
						if (!scope.serverEditNew && editServerName !== scope.selectedServer.torpchat.name) {
							delete $scope.ircServerList[scope.selectedServer.torpchat.name];
						}
						$scope.ircServerList[editServerName] = cloneObj(scope.serverEditScope.serverDetails);
						scope.windowScope.selectedServer = $scope.ircServerList[editServerName];
					});
					
					return true;
				}
				else {
					return false;
				}
			};
			
			scope.tcDialogOptions = {
				templateUrl: '/templates/ServerEdit',
				attrs: {
					title: 'TORPChat - ' + scope.serverEditTitle,
					style: 'display: none;'
				},
				draggable: true,
				resizable: true,
				minWidth: 360,
				minHeight: 604,
				modal: true,
				buttons: [
					{
						text: "Save",
						title: "connect to selected server",
						"class": "btn btn-primary pull-right",
						click: function() {
							if (saveFn(this)) {
								$(this).tcdialog('close');
							}
						}
					},
					{
						text: "Cancel",
						"class": "btn pull-left",
						click: function() {
							$(this).tcdialog('close');
						}
					}
				],
				open: function(event, ui) {
					$(this).find('input').blur();
					$('#' + scope.windowScope.tcDialogStates.serverList).tcdialog("disable");
					scope.tcScope.tcDialogStates.serverEdit = $(this).attr('id');
				},
				close: function(event, ui) {
					$('#' + scope.windowScope.tcDialogStates.serverList).tcdialog("enable");
					$(this).scope().$destroy();
					$(this).remove();
					scope.tcScope.tcDialogStates.serverEdit = false;
				}
			};


			return tcDialog(scope);
		};

		return newEditServer;
	};
	
	// Open a delete confirmation dialog, deletes selected server if user proceeds.
	services.tcServerDelete = function(tcDialog) {
		var deleteServer = function(scope) {
			var selectedServer = scope.windowScope.selectedServer,
			serverName = selectedServer.torpchat.name,
			deleteFn = function() {
				delete scope.tcScope.ircServerList[serverName];
				scope.windowScope.selectedServer = scope.tcScope.ircServerList[_.keys(scope.tcScope.ircServerList)[0]];
				scope.tcScope.$digest();
			};
			scope.tcDialogOptions = {
				template: '<p class="text-center">Are you sure you want to delete '+serverName+' from the server list?</p>',
				attrs: {
					title: 'confirm delete',
					style: 'display: none;'
				},
				draggable: true,
				resizable: false,
				width: 380,
				modal: true,
				buttons: [
					{
						text: "Delete",
						title: "delete "+serverName,
						"class": "btn btn-danger",
						tabindex: -1,
						click: function() {
							deleteFn();
							$(this).tcdialog('close');
						}
					},
					{
						text: "Cancel",
						"class": "btn",
						tabindex: -1,
						click: function() {
							$(this).tcdialog('close');
						}
					}
				],
				open: function(event, ui) {
					$('#' + scope.windowScope.tcDialogStates.serverList).tcdialog("disable");
				},
				close: function(event, ui) {
					$('#' + scope.windowScope.tcDialogStates.serverList).tcdialog("enable");
					$(this).scope().$destroy();
					$(this).remove();
				}
			};
			
			return tcDialog(scope);
		};
		
		return deleteServer;
	};
	
	// Opens a Domain edit Dialog box
	services.tcDomainEdit = function(tcDialog, tcAlert) {
		var newEditDomain = function(scope) {
			var validateFn = function(that) {
				if (scope.formScope.domainEditForm.$valid) {
					return true;
				}
				else {
					if (!scope.formScope.domainEditForm.domain.$valid) {
						scope.formScope.domainSubmitState.error = true;
						var alertScope = scope.$new();
						alertScope.tcAlert = {
							title: 'Invalid Domain',
							message: 'Please use a valid domain url!',
							buttonClass: 'btn-danger',
							close: function() {
								$(that).find('.error').first().find('input').focus();
							}
						};
						tcAlert(alertScope);
					}
					else if (!scope.formScope.domainEditForm.port.$valid) {
						scope.formScope.portSubmitState.error = true;
						var alertScope2 = scope.$new();
						alertScope2.tcAlert = {
							title: 'Invalid Port',
							message: 'Please use a valid port number!',
							buttonClass: 'btn-danger',
							close: function() {
								$(that).find('.error').first().find('input').focus();
							}
						};
						tcAlert(alertScope2);
					}
					scope.formScope.$digest();
					return false;
				}
			},
			saveFn = function(that) {
				if (validateFn(that)) {
					if (scope.domainEditNew) { // we are saving a new domain
						scope.serverEditScope.$apply(function($scope) {
							var index = $scope.serverDetails.torpchat.domains.push({
								domain: scope.formScope.domainDetails.domain,
								port: scope.formScope.domainDetails.port
							}) - 1;
							$scope.selectedDomain = $scope.serverDetails.torpchat.domains[index];
						});
					}
					else { // we are saving an existing domain
						scope.$apply(function($scope) {
							$scope.selectedDomain.domain = scope.formScope.domainDetails.domain;
							$scope.selectedDomain.port = scope.formScope.domainDetails.port;
						});
					}

					return true;
				}
				else {
					return false;
				}
			};
			
			scope.tcDialogOptions = {
				templateUrl: '/templates/DomainEdit',
				attrs: {
					title: 'TORPChat - ' + scope.domainEditTitle,
					style: 'display: none;'
				},
				draggable: true,
				resizable: false,
				width: 400,
				height: 242,
				modal: true,
				buttons: [
					{
						text: "Save",
						title: "connect to selected server",
						"class": "btn btn-primary pull-right",
						click: function() {
							if (saveFn(this)) {
								$(this).tcdialog('close');
							}
						}
					},
					{
						text: "Cancel",
						"class": "btn pull-left",
						click: function() {
							$(this).tcdialog('close');
						}
					}
				],
				open: function(event, ui) {
					$(this).find('input').blur();
					$('#' + scope.tcScope.tcDialogStates.serverEdit).tcdialog("disable");
				},
				close: function(event, ui) {
					$('#' + scope.tcScope.tcDialogStates.serverEdit).tcdialog("enable");
					$(this).scope().$destroy();
					$(this).remove();
				}
			};
			
			return tcDialog(scope);
		};
		
		return newEditDomain;
	};
	
	// Open a delete confirmation dialog, deletes selected domain if user proceeds.
	services.tcDomainDelete = function(tcDialog) {
		var deleteDomain = function(scope) {
			var selectedDomain = scope.serverEditScope.selectedDomain,
			domainIndex = _.indexOf(scope.serverEditScope.serverDetails.torpchat.domains, selectedDomain),
			deleteFn = function() {
				scope.serverEditScope.serverDetails.torpchat.domains.splice(domainIndex,1);
				scope.serverEditScope.selectedDomain = scope.serverEditScope.serverDetails.torpchat.domains[0];
				scope.serverEditScope.$digest();
			};
			scope.tcDialogOptions = {
				template: '<p class="text-center">Are you sure you want to delete '+selectedDomain.domain+' from the domain list?</p>',
				attrs: {
					title: 'confirm delete',
					style: 'display: none;'
				},
				draggable: true,
				resizable: false,
				width: 380,
				modal: true,
				buttons: [
					{
						text: "Delete",
						title: "delete "+selectedDomain.domain,
						"class": "btn btn-danger",
						tabindex: -1,
						click: function() {
							deleteFn();
							$(this).tcdialog('close');
						}
					},
					{
						text: "Cancel",
						"class": "btn",
						tabindex: -1,
						click: function() {
							$(this).tcdialog('close');
						}
					}
				],
				open: function(event, ui) {
					$('#' + scope.tcScope.tcDialogStates.serverEdit).tcdialog("disable");
				},
				close: function(event, ui) {
					$('#' + scope.tcScope.tcDialogStates.serverEdit).tcdialog("enable");
					$(this).scope().$destroy();
					$(this).remove();
				}
			};
			
			return tcDialog(scope);
		};
		
		return deleteDomain;
	};

	return services;

});
