import { WINDOW } from "../../../../src/rxcomp";

export default class LocalStorageService {
	static supported = false;
	static delete(name: string) {
		if (this.isLocalStorageSupported()) {
			WINDOW.localStorage.removeItem(name);
		}
	}
	static exist(name: string): boolean {
		if (this.isLocalStorageSupported()) {
			return WINDOW.localStorage[name] !== undefined;
		} else {
			return false;
		}
	}
	static get(name: string): any {
		let value = null;
		if (this.isLocalStorageSupported() && WINDOW.localStorage[name] !== undefined) {
			try {
				value = JSON.parse(WINDOW.localStorage[name]);
			} catch (e) {
				console.log('LocalStorageService.get.error parsing', name, e);
			}
		}
		return value;
	}
	static set(name: string, value: any) {
		if (this.isLocalStorageSupported()) {
			try {
				const cache: any[] = [];
				const json = JSON.stringify(value, function (key, value) {
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				WINDOW.localStorage.setItem(name, json);
			} catch (e) {
				console.log('LocalStorageService.set.error serializing', name, value, e);
			}
		}
	}
	static isLocalStorageSupported(): boolean {
		if (this.supported) {
			return true;
		}
		let supported = false;
		try {
			supported = 'localStorage' in WINDOW && WINDOW.localStorage !== null;
			if (supported) {
				WINDOW.localStorage.setItem('test', '1');
				WINDOW.localStorage.removeItem('test');
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
