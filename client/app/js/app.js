window._ = window.underscore = require('underscore');
window.TWEEN = require('@tweenjs/tween.js');

var RAF = require('./components/raf');

var Router = require('./router.js');
var Views = require('./views');
var Utils = window.Utils =  require('./utils.js');

window.App = {
	Views: Views,
	Router: Router,
	Raf: RAF,
	pageVisibility: true,
	init: function () {
		// Request Animation Frame
		App.Raf.start();
		if(currentWindow.custom.theme){
			document.body.setAttribute('data-state', currentWindow.custom.theme);
		}
		// History
		this.instance = App.Views.Wrapper;
		App.Router.init();

		const current = ipcRenderer.sendSync('callSyncMethod', 'getCurrentUser')
		const profiles = ipcRenderer.sendSync('callSyncMethod', 'getSettings')
		
		if(profiles[current].label){
			new Notification('gUmi', {
				title: "User",
				body: "Current user is: " + profiles[current].label
			});
		}
		// Event Listeners to propagate
		this.addEventListeners();
	},

	addEventListeners: function(){
		var visProp = Utils.getHiddenProp();
		if (visProp) {
			var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
			document.addEventListener(evtname, this.onChangePageVisibility, false);
		}

		window.addEventListener( 'resize', this.onResize);
		ipcRenderer.on('changeTheme', App.changeTheme);
		ipcRenderer.on('changeUser', App.changeUser);

		this.onResize();
	},
	changeTheme: function(e, theme){
		document.body.setAttribute('data-state', theme);
	},
	changeUser: function(e, user){
		App.Router.refresh()
		new Notification('gUmi', {
			title: "Switch user",
			body: "Current user is " + user
		});
	},
	onChangePageVisibility: function(){
		App.pageVisibility = !Utils.pageIsHidden();
	},
	
	onResize: function(){
		//get the width and height
		App.w_w = window.innerWidth;
		App.w_h = window.innerHeight;
	}
};

window.App.init();