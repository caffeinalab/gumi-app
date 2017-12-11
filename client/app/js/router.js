var currentState = undefined;

function init(){
	navigate(currentWindow.custom.currentState);
};

function goToProfileList(){
	var view = new App.Views.ProfileList();
	App.instance.goto(view);
};

function goToProfileForm(){
	var view = new App.Views.ProfileForm();
	App.instance.goto(view);
};

function navigate(state){
	if(state == currentState){
		return;
	}
	currentState = state;

	switch(currentState){
		case 'profile-list':
			goToProfileList();
			break;
		case 'profile-form':
			goToProfileForm();
			break;
		default:
	}
};

module.exports = {
	init: init,
	navigate: navigate
};