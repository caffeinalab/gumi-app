var currentState = undefined;

function init(){
	navigate(currentWindow.custom.currentState);
};

function goToHome(){
	var view = new App.Views.Home();
	App.instance.goto(view);
};

function goToNewUser(){
	var view = new App.Views.AddUser();
	App.instance.goto(view);
};

function goToModifyUser(){
	var view = new App.Views.ModifyUser();
	App.instance.goto(view);
};

function navigate(state){
	if(state == currentState){
		return;
	}
	currentState = state;

	switch(currentState){
		case 'list':
			goToHome();
			break;
		case 'new-profile':
			goToNewUser();
			break;
		case 'edit-profile':
			goToModifyUser();
			break;
		default:
	}
};

module.exports = {
	init: init,
	navigate: navigate
};