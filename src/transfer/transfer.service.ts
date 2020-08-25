import { isPlatformBrowser } from "../platform/platform";

export default class TransferService {

	static makeKey(url: string, params?: { [key: string]: any }): string {
		url = params ? flatMap_(url, params) : url;
		url = url.replace(/(\W)/gm, '_');
		const key: string = `rxcomp_hydrate_${url}`;
		// console.log('TransferService.makeKey', key, url);
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
		// console.log('TransferService.set', key, value);
		const json: string | undefined = this.encode(value);
		if (!json) {
			return;
		}
		const text = document.createTextNode(json);
		let node = document.querySelector(`#${key}`);
		if (!node) {
			node = document.createElement('script');
			node.setAttribute('id', key);
			node.setAttribute('type', 'text/template');
			// console.log('node', node!!, 'document', document!!, 'head', document.head!!);
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

	static encode(value: { [key: string]: any }): string | undefined {
		let encoded: string | undefined;
		try {
			const pool: Map<any, boolean> = new Map();
			const json: string = JSON.stringify(value, function (key, value) {
				if (typeof value === 'object' && value != null) {
					if (pool.has(value)) {
						// console.warn(`TransferService circular reference found, discard key "${key}"`);
						return;
					}
					pool.set(value, true);
				}
				return value;
			});
			// encoded = this.toBase64(encodeURIComponent(json));
			encoded = json;
		} catch (error) {
			// console.warn('TransferService.encode.error', value, error);
		}
		return encoded;
	}

	static decode<T>(encoded: string): T | undefined {
		let decoded: T | undefined;
		if (encoded) {
			try {
				// decoded = JSON.parse(decodeURIComponent(this.fromBase64(encoded))) as T;
				decoded = JSON.parse(encoded) as T;
			} catch (error) {
				// console.warn('TransferService.decode.error', encoded);
			}
		}
		return decoded;
	}

	static toBase64(s: string): string {
		if (isPlatformBrowser) {
			return atob(s);
		} else {
			return Buffer.from(s).toString('base64');
		}
	}

	static fromBase64(s: string): string {
		if (isPlatformBrowser) {
			return btoa(s);
		} else {
			return Buffer.from(s, 'base64').toString();
		}
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
