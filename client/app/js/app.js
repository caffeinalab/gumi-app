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

		this.onResize();
	},
	changeTheme: function(e, theme){
		document.body.setAttribute('data-state', theme);
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