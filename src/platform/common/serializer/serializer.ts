import { isPlatformBrowser } from "../../platform";

export default class Serializer {
	// static encode(value: any, encoders: ((from: any) => any)[] = [encodeJson, encodeBase64, encodeUriComponent]): any {
	static encode<T>(value: any, encoders: ((from: any) => any)[]): T | undefined;
	static encode(value: any, encoders: ((from: any) => any)[] = [encodeJson]): any {
		return encoders.reduce((p, c) => c(p), value);
	}

	// static decode(value: any, decoders: ((from: any) => any)[] = [decodeUriComponent, decodeBase64, decodeJson]): any {
	static decode<T>(value: any, decoders: ((from: any) => any)[]): T | undefined;
	static decode(value: any, decoders: ((from: any) => any)[] = [decodeJson]): any {
		return decoders.reduce((p, c) => c(p), value);
	}
}

export function encodeJson(value: any): string {
	let decoded: any;
	try {
		const pool: Map<any, boolean> = new Map();
		const json: string = JSON.stringify(value, function (key, value) {
			if (typeof value === 'object' && value != null) {
				if (pool.has(value)) {
					// console.warn(`Serializer.encodeJson.error`, `circular reference found, discard key "${key}"`);
					return;
				}
				pool.set(value, true);
			}
			return value;
		});
		decoded = json;
	} catch (error) {
		// console.warn(`Serializer.encodeJson.error`, value, error);
	}
	return decoded;
}

export function decodeJson(value: string): any {
	let decoded: any;
	if (value) {
		try {
			decoded = JSON.parse(value);
		} catch (error) {
			// console.warn(`Serializer.decodeJson.error`, value, error);
		}
	}
	return decoded;
}

export function encodeBase64(value: string): string {
	return isPlatformBrowser ? atob(value) : Buffer.from(value).toString('base64');
}

export function decodeBase64(value: string): string {
	return isPlatformBrowser ? btoa(value) : Buffer.from(value, 'base64').toString();
}