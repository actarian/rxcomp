export default class TransferService {

	static makeKey(url: string, params?: { [key: string]: any }): string {
		url = params ? flatMap_(url, params) : url;
		url = url.replace(/(\W)/gm, '_');
		const key: string = `rxcomp_hydrate_${url}`;
		console.log('TransferService.makeKey', key, url);
		return key;
	}

	static has(key: string): boolean {
		const script = document.querySelector(`#${key}`);
		return script !== null;
	}

	static get(key: string): { [key: string]: any } | undefined;
	static get<T>(key: string): T | undefined {
		const node = document.querySelector(`#${key}`);
		if (node && node.firstChild) {
			const json: string | null = node.firstChild.nodeValue;
			return json ? this.decode<T>(json) : undefined;
		} else {
			return undefined;
		}
	}

	static set(key: string, value: { [key: string]: any }): void {
		console.log('TransferService.set', key, value);
		const json: string | null = this.encode(value);
		if (!json) {
			return;
		}
		const text = document.createTextNode(json);
		let node = document.querySelector(`#${key}`);
		if (!node) {
			node = document.createElement('script');
			node.setAttribute('id', key);
			node.setAttribute('type', 'text/template');
			node.append(text);
			document.head!.append(node);
		} else {
			node.replaceChild(text, node.firstChild!);
		}
	}

	static remove(key: string): void {
		let node = document.querySelector(`#${key}`);
		if (node && node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	static encode(value: { [key: string]: any }): string | null {
		let encodedJson: string | null = null;
		try {
			const cache: Map<any, boolean> = new Map();
			const json: string = JSON.stringify(value, function (key, value) {
				if (typeof value === 'object' && value != null) {
					if (cache.has(value)) {
						// console.warn(`TransferService circular reference found, discard key "${key}"`);
						return;
					}
					cache.set(value, true);
				}
				return value;
			});
			encodedJson = btoa(encodeURIComponent(json));
		} catch (error) {
			// console.warn('TransferService.encode.error', value, error);
		}
		return encodedJson;
	}

	static decode<T>(encodedJson: string): T {
		let value: any;
		if (encodedJson) {
			try {
				value = JSON.parse(decodeURIComponent(atob(encodedJson)));
			} catch (error) {
				// console.warn('TransferService.decode.error', encodedJson);
				value = encodedJson;
			}
		}
		return value;
	}

}

function flatMap_(s: string, x: any): string {
	if (typeof x === 'number') {
		s += x.toString();
	} else if (typeof x === 'string') {
		s += x.substr(0, 10);
	} else if (x && typeof x === 'object') {
		s += '_' + Object.keys(x).map(k => k + '_' + flatMap_('', x[k])).join('_');
	}
	return s;
}
