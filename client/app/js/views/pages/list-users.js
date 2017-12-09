import Template from '../template';

module.exports = function(){
	var Tmp = new Template();
	var el = Tmp.createEl('page user -fullSize');

	function render () {
		var template =  _.template(document.getElementById('list-users-template').innerText);
    	el.innerHTML = template({
    		title: "Your profiles"
    	});
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