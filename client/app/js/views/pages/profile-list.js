import Template from '../template';

module.exports = function(){
	var Tmp = new Template();
	var el = Tmp.createEl('page user -fullSize');

	function render () {
		var template =  _.template(document.getElementById('profile-list-template').innerText);
    	el.innerHTML = template({
    		title: "Your profiles",
    		currentProfile: currentWindow.custom.currentUser,
    		profiles: currentWindow.custom.getSettings()
    	});

    	requestAnimationFrame(function(){
    		addListeners(el);
    	})
	}
	function addListeners(el){
		[].slice.call( el.querySelectorAll( '.singleProfile .select' ) ).forEach( function( selectButton ) {
			// events:
			selectButton.addEventListener( 'click', function(e){
				if(!e.target.dataset.extra) { return; }
				
				var current = el.querySelector('.singleProfile.current');
				if(current) current.classList.remove('current');

				currentWindow.custom.activateSetting(e.target.dataset.extra);
				e.target.parentNode.classList.add('current');
			});
		} );
	}

	function remove(){
		if(Tmp){
			Tmp.stopTween();
			Tmp = null;
		}
		if(el){
			el.remove();
			el = null;
		}
	}

	return {
		el: el,
		render: render,
		transitionIn: Tmp.transitionIn,
		transitionOut: Tmp.transitionOut,
		remove: remove
	}
}