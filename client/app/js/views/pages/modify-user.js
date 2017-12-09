import Template from '../template';


function onInputFocus( ev ) {
	ev.target.parentNode.classList.add('input--filled');
}
function onInputBlur( ev ) {
	if( ev.target.value.trim() === '' ) {
		ev.target.parentNode.classList.remove('input--filled');
	}
}

module.exports = function(){
	var Tmp = new Template();
	var el = Tmp.createEl('page user -fullSize');

	function render () {
		var template =  _.template(document.getElementById('home-template').innerText);
		var opts = {
    		title: "edit profile",
    	};

		if(App.currentExtra){
			var settings = currentWindow.custom.getSettings()
			if(settings[App.currentExtra]){
				opts.username = settings[App.currentExtra].username;
				opts.email = settings[App.currentExtra].email;
				opts.label = settings[App.currentExtra].label;
			}
		}
    	el.innerHTML = template(opts);
    	requestAnimationFrame(function(){
			[].slice.call( el.querySelectorAll( 'input.input__field' ) ).forEach( function( inputEl ) {
				// in case the input is already filled..
				if( inputEl.value.trim() !== '' ) {
					inputEl.parentNode.classList.add('input--filled');
				}
				// events:
				inputEl.addEventListener( 'focus', onInputFocus );
				inputEl.addEventListener( 'blur', onInputBlur );
			} );
		})
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