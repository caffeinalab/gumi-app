import Template from '../template';
// trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
	(function() {
		// Make sure we trim BOM and NBSP
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		String.prototype.trim = function() {
			return this.replace(rtrim, '');
		};
	})();
}

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
    	el.innerHTML = template({
    		title: "Add user",
    		label: "ADD"
    	});
    	requestAnimationFrame(function(){
			[].slice.call( document.querySelectorAll( 'input.input__field' ) ).forEach( function( inputEl ) {
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