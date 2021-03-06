import { isPlatformBrowser } from "../../platform";

/**
 * @example Serializer.encode(value, [encodeJson, encodeUriComponent, encodeBase64]);
 * @example Serializer.decode(value, [decodeBase64, decodeUriComponent, decodeJson]);
 */
export default class Serializer {
	static encode<T>(value: any, encoders: ((from: any) => any)[]): T;
	static encode(value: any, encoders: ((from: any) => any)[] = [encodeJson]): any {
		return encoders.reduce((p, c) => c(p), value);
	}

	static decode<T>(value: any, decoders: ((from: any) => any)[]): T;
	static decode(value: any, decoders: ((from: any) => any)[] = [decodeJson]): any {
		return decoders.reduce((p, c) => c(p), value);
	}

	static encodeJson<T>(value: any): T;
	static encodeJson(value: any): any {
		return this.encode(value, [encodeJson]);
	}

	static decodeJson<T>(value: any): T;
	static decodeJson(value: any): any {
		return this.decode(value, [decodeJson]);
	}

	static encodeBase64<T>(value: any): T;
	static encodeBase64(value: any): any {
		return this.encode(value, [encodeJson, encodeBase64]);
	}

	static decodeBase64<T>(value: any): T;
	static decodeBase64(value: any): any {
		return this.decode(value, [decodeBase64, decodeJson]);
	}
}
export function encodeJson(value: any, circularRef?: any, space?: string | number): string {
	let decoded: any;
	try {
		// const pool: Map<any, boolean> = new Map();
		const pool: any[] = [];
		const json: string = JSON.stringify(value, function (key, value) {
			if (typeof value === 'object' && value != null) {
				// if (pool.has(value)) {
				if (pool.indexOf(value) !== -1) {
					// console.warn(`Serializer.encodeJson.error`, `circular reference found, discard key "${key}"`);
					return circularRef;
				}
				pool.push(value);
				// pool.set(value, true);
			}
			return value;
		}, space);
		decoded = json;
	} catch (error) {
		// console.warn(`Serializer.encodeJson.error`, value, error);
	}
	return decoded;
}
export function encodeJsonWithOptions(circularRef?: any, space?: string | number): (value: any) => string {
	return (value: any) => encodeJson(value, circularRef, space);
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
	let encoded: string;
	try {
		encoded = isPlatformBrowser ? btoa(value) : Buffer.from(value).toString('base64');
	} catch (error) {
		encoded = value;
	}
	return encoded;
}
export function decodeBase64(value: string): string {
	let decoded: string;
	try {
		decoded = isPlatformBrowser ? atob(value) : Buffer.from(value, 'base64').toString();
	} catch (error) {
		decoded = value;
	}
	return decoded;
}
