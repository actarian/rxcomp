// Polyfills for IE11

if (typeof Object.assign != 'function') {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) { // .length of function is 2
			'use strict';
			if (target == null) { // TypeError if undefined or null
				throw new TypeError('Cannot convert undefined or null to object');
			}
			var to = Object(target);
			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];
				if (nextSource != null) { // Skip over if undefined or null
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}

if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, 'find', {
		value: function(predicate) {
			'use strict';
			if (this == null) {
				throw new TypeError('Array.prototype.find called on null or undefined');
			}
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}
			var list = Object(this);
			var length = list.length >>> 0;
			var thisArg = arguments[1];
			for (var i = 0; i !== length; i++) {
				if (predicate.call(thisArg, this[i], i, list)) {
					return this[i];
				}
			}
			return undefined;
		}
	});
}

if (!Array.prototype.fill) {
	Object.defineProperty(Array.prototype, 'fill', {
		value: function(value) {
			// Steps 1-2.
			if (this == null) {
				throw new TypeError('this is null or not defined');
			}
			var O = Object(this);
			// Steps 3-5.
			var len = O.length >>> 0;
			// Steps 6-7.
			var start = arguments[1];
			var relativeStart = start >> 0;
			// Step 8.
			var k = relativeStart < 0 ?
				Math.max(len + relativeStart, 0) :
				Math.min(relativeStart, len);
			// Steps 9-10.
			var end = arguments[2];
			var relativeEnd = end === undefined ?
				len : end >> 0;
			// Step 11.
			var final = relativeEnd < 0 ?
				Math.max(len + relativeEnd, 0) :
				Math.min(relativeEnd, len);
			// Step 12.
			while (k < final) {
				O[k] = value;
				k++;
			}
			// Step 13.
			return O;
		}
	});
}
