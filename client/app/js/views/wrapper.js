import Template from './template';

var body;
var previous = null;
var next = null;
var currentPage = null;

var tweenFade;
var panelTransition = document.getElementById('panelTransition');

function goto(view){
	if(!body){
		body = document.getElementById('wrapper');
	}
	if(previous){
	  previous.remove();
	  previous = null;
	}
	if(next){
	  next.remove();
	  next = null;
	}
	previous = currentPage;
	
	next = view;

	if (previous) {
		translate('in', 300, () => {
			if(previous){
				previous.remove();
				previous = null;
			}
			if(next){
				next.render();
				translate('out', 200, () => {
					body.append( next.el );
					next.transitionIn();
					addLinkEvent();
					currentPage = next;
					next = null;
				});
			}
		});
	}else{
		next.render();
		body.append( next.el );
		addLinkEvent();
		next.transitionIn();
		currentPage = next;
		next = null;
	}
}

function getCurrentPage(){
	return currentPage;
}

function addLinkEvent(){
	var allLinks = document.getElementById("wrapper").querySelectorAll('._internalLink');
	for (var i = 0; i < allLinks.length; i++) {
		allLinks[i].addEventListener("click",function(e) {
			// e.target was the clicked element
			if (e.currentTarget && e.currentTarget.dataset.state) {
		    	App.Router.navigate(e.currentTarget.dataset.state);
			}
			if (e.currentTarget && e.currentTarget.dataset.extra) {
		    	App.currentExtra = e.currentTarget.dataset.extra;
			}
		});
	}
}

function translate(type, time, cb){
	var startData = {
		translate: panelTransition.dataset.translate || 100
	};
	var endData = {
		translate: type == "out" ? -100 : 0
	};

	tweenFade = new TWEEN.Tween(startData).to(endData, time)
	.onUpdate(function(){
		console.log(startData.translate);
		panelTransition.dataset.translate = startData.translate;
		window.Utils.setTransformStyle(panelTransition, 'translateX('+ startData.translate +'%)')
	})
	.onComplete(function(){
		if(type == "in"){
			panelTransition.dataset.translate = 0;
			window.Utils.setTransformStyle(panelTransition, 'translateX('+ 0 +'%)')
		}else{
			panelTransition.dataset.translate = 100;
			window.Utils.setTransformStyle(panelTransition, 'translateX('+ 100 +'%)')
		}
		cb();
		tweenFade = undefined;
	})
	.start();
}

module.exports = {
	getCurrentPage: getCurrentPage,
	goto: goto
};


