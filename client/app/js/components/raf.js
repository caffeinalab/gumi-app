require('../vendor/raf-polyfill');

// REQUEST ANIMATION FRAME
var idRaf = '',
	requestedAnimation = [];

function add(a){
	requestedAnimation.push(a);
	return requestedAnimation.length - 1;
}

function remove(index){
	requestedAnimation[index] = null;
}

function update(time){
	// if(!App.pageVisibility){ return; }

	App.clock = time;
	TWEEN.update(App.clock);

	if(requestedAnimation.length > 0){
		for (var i = requestedAnimation.length - 1; i >= 0; i--) {
			if(requestedAnimation[i] != null){
				requestedAnimation[i]();
			}
		}
	}

}

function loop(time){
	update(time);
	idRaf = requestAnimationFrame( loop );
}

function start(){
	loop();
}

function stop(){
	cancelAnimationFrame(idRaf)
}

module.exports = {
	start: start,
	stop: stop,
	add: add,
	remove: remove		
};