export default class LocalStorageService {

	static delete(name) {
		if (this.isLocalStorageSupported()) {
			window.localStorage.removeItem(name);
		}
	}

	static exist(name) {
		if (this.isLocalStorageSupported()) {
			return window.localStorage[name] !== undefined;
		}
	}

	static get(name) {
		let value = null;
		if (this.isLocalStorageSupported() && window.localStorage[name] !== undefined) {
			try {
				value = JSON.parse(window.localStorage[name]);
			} catch (e) {
				console.log('LocalStorageService.get.error parsing', name, e);
			}
		}
		return value;
	}

	static set(name, value) {
		if (this.isLocalStorageSupported()) {
			try {
				const cache = [];
				const json = JSON.stringify(value, function(key, value) {
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				window.localStorage.setItem(name, json);
			} catch (e) {
				console.log('LocalStorageService.set.error serializing', name, value, e);
			}
		}
	}

	static isLocalStorageSupported() {
		if (this.supported) {
			return true;
		}
		let supported = false;
		try {
			supported = 'localStorage' in window && window.localStorage !== null;
			if (supported) {
				window.localStorage.setItem('test', '1');
				window.localStorage.removeItem('test');
			} else {
				supported = false;
			}
		} catch (e) {
			supported = false;
		}
		this.supported = supported;
		return supported;
	}

}
