import Template from '../template';

function onInputFocus( ev ) {
	ev.target.parentNode.classList.add('input--filled');
	ev.target.parentNode.classList.remove('error');
}

function onInputBlur( ev ) {
	if( ev.target.value.trim() === '' ) {
		ev.target.parentNode.classList.remove('input--filled');
	}
}

function onSave(){
	var label = document.getElementById('label');
	var username = document.getElementById('username');
	var email = document.getElementById('email');
	var error = false;

	label.parentNode.classList.remove('error');
	username.parentNode.classList.remove('error');
	email.parentNode.classList.remove('error');
	
	if(label.value == ''){
		label.parentNode.classList.add('error');
		error = true;
	}
	
	if(username.value == ''){
		username.parentNode.classList.add('error');
		error = true;
	}
	
	if(email.value == ''){
		email.parentNode.classList.add('error');
		error = true;
	}

	if(error){
		return false;
	}
	var id = Date.now();
	var ob = {};
	ob[id] = {
		label: label.value,
		username: username.value,
		email: email.value,
	};
	currentWindow.custom.insertOrUpdateSetting(ob);

	App.Router.navigate('profile-list');
}

function addFormListeners(el){

	el.querySelector('#saveButton').addEventListener( 'click', onSave );

	[].slice.call( el.querySelectorAll( 'input.input__field' ) ).forEach( function( inputEl ) {
		// in case the input is already filled..
		if( inputEl.value.trim() !== '' ) {
			inputEl.parentNode.classList.add('input--filled');
		}
		// events:
		inputEl.addEventListener( 'focus', onInputFocus );
		inputEl.addEventListener( 'blur', onInputBlur );
	} );
}

module.exports = function(){
	var Tmp = new Template();
	var el = Tmp.createEl('page user -fullSize');
	var currentIDProfile = '';
	function render () {
		var template =  _.template(document.getElementById('profile-form-template').innerText);
		var opts = {
    		title: "add profile",
    	};

		if(App.currentExtra){
			var settings = currentWindow.custom.getSettings();
			if(settings[App.currentExtra]){
				currentIDProfile = App.currentExtra;
				opts.title = "edit profile";
				opts.label = settings[App.currentExtra].label;
				opts.username = settings[App.currentExtra].username;
				opts.email = settings[App.currentExtra].email;
			}
			App.currentExtra = undefined;
		}

    	el.innerHTML = template(opts);
    	requestAnimationFrame(function(){
    		addFormListeners(el);
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