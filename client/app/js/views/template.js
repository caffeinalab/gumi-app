module.exports = function(){
	var tweenFade = '';
	var el = '';
	function createEl(classList){
		classList = classList.split(" ");
		el = document.createElement('div')
		for (var i = 0; i < classList.length; i++) {
			el.classList.add(classList[i]);
		}
		return el;
	}

	function transitionIn (callback) {
		var transitionIn = () => {
			fade('in', 500, () => {
				if (_.isFunction(callback)) {
					 _.delay(callback, 400);
				}
			})
		};

		_.delay(transitionIn, 200);
	};

	function transitionOut (callback) {
		fade( 'out', 500, () => {
			if (_.isFunction(callback)) {
				callback();
			}
		});
	};

	function stopTween(){
		if(tweenFade){ 
			tweenFade.stop();
			TWEEN.remove(tweenFade);
			tweenFade = undefined;
		}
	}

	function fade(type, time, cb){
		var toAnimate = el;//.getElementsByClassName('content');
		// toAnimate = toAnimate.length ? toAnimate[0] : el

		var startData = {
			opacity: toAnimate.style.opacity || parseFloat(window.getComputedStyle(toAnimate, null).opacity)
		};
		var endData = {
			opacity: type == "out" ? 0 : 1
		};

		tweenFade = new TWEEN.Tween(startData).to(endData, time)
		.onUpdate(function(){
			toAnimate.style.opacity = startData.opacity;
		})
		.onComplete(function(){
			cb();
			tweenFade = undefined;
		})
		.start();
	}

	return {
		createEl: createEl,
		stopTween:stopTween,
		transitionIn: transitionIn,
		transitionOut: transitionOut,
	}

}