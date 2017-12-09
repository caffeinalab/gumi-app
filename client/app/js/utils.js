window.performance = (window.performance || {
    offset: Date.now(),
    now: function now(){
        return Date.now() - this.offset;
    }
});

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

module.exports = new function() {
	var prefix = null, hiddenProp= null, transitionEnd = null, animationEnd = null;

	function getHiddenProp (){
		if (hiddenProp == null) {
			var prefixes = ['webkit','moz','ms','o'];

			// if 'hidden' is natively supported just return it
			if ('hidden' in document) return 'hidden';

			// otherwise loop over all the known prefixes until we find one
			for (var i = 0; i < prefixes.length; i++){
				if ((prefixes[i] + 'Hidden') in document){
					hiddenProp = prefixes[i] + 'Hidden';
					return hiddenProp;
				}
			}
			return null;
		}
		return hiddenProp;
		// otherwise it's not supported
	}

	function pageIsHidden () {
		var prop = getHiddenProp();
		if (!prop) return false;

		return document[prop];
	}

	function getVendorPrefix() {
		if (prefix == null) {
			var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice
			.call(styles)
			.join('')
			.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
			)[1],
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
			prefix = {
				dom: dom,
				lowercase: pre,
				css: '-' + pre + '-',
				js: pre[0].toUpperCase() + pre.substr(1)
			};
		}
		return prefix;
	}
	
	function normalize (x, min, max){
		return (x-min)/(max-min)
	}

	function millisToMinutesAndSeconds (millis) {
		var minutes = Math.floor(millis / 60000);
		var seconds = ((millis % 60000) / 1000).toFixed(0);
		var decimals = ( ( (millis % 60000 / 1000) % 1 ) * 100).toFixed(0);
		if(decimals == 0){
			decimals = 1;
		}
		return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ":" + (decimals < 10 ? '0' : '') + decimals;
	}
	function setTransformStyle (el, style){
		el.style.webkitTransform = style;
		el.style.MozTransform = style;
		el.style.msTransform = style;
		el.style.OTransform = style;
		el.style.transform = style;
	}

	function detectTransitionEndEvent(){
		if(transitionEnd){
			return transitionEnd;
		}
	    var t;
	    var el = document.createElement('fakeelement');
	    var transitions = {
	      'transition':'transitionend',
	      'OTransition':'oTransitionEnd',
	      'MozTransition':'transitionend',
	      'WebkitTransition':'webkitTransitionEnd'
	    }

	    for(t in transitions){
	        if( el.style[t] !== undefined ){
	        	transitionEnd = transitions[t];
	            return transitions[t];
	        }
	    }
	}

	function detectAnimationEndEvent(){
		if(animationEnd){
			return animationEnd;
		}
	    var t;
	    var el = document.createElement('fakeelement');
	    var transitions = {
	      'transition':'animationend',
	      'OTransition':'oanimationend',
	      'MsTransition':'MSAnimationEnd',
	      'WebkitTransition':'webkitAnimationEnd'
	    }

	    for(t in transitions){
	        if( el.style[t] !== undefined ){
	        	animationEnd = transitions[t];
	            return transitions[t];
	        }
	    }
	}

	return {
		getHiddenProp: getHiddenProp,
		pageIsHidden: pageIsHidden,
		setTransformStyle: setTransformStyle,
		millisToMinutesAndSeconds: millisToMinutesAndSeconds,
		detectTransitionEndEvent: detectTransitionEndEvent,
		detectAnimationEndEvent: detectAnimationEndEvent
	}
}();

