import { isPlatformBrowser } from "../../platform";
/**
 * @example Serializer.encode(value, [encodeJson, encodeUriComponent, encodeBase64]);
 * @example Serializer.decode(value, [decodeBase64, decodeUriComponent, decodeJson]);
 */
export default class Serializer {
    static encode(value, encoders = [encodeJson]) {
        return encoders.reduce((p, c) => c(p), value);
    }
    static decode(value, decoders = [decodeJson]) {
        return decoders.reduce((p, c) => c(p), value);
    }
    static encodeJson(value) {
        return this.encode(value, [encodeJson]);
    }
    static decodeJson(value) {
        return this.decode(value, [decodeJson]);
    }
    static encodeBase64(value) {
        return this.encode(value, [encodeJson, encodeBase64]);
    }
    static decodeBase64(value) {
        return this.decode(value, [decodeBase64, decodeJson]);
    }
}
export function encodeJson(value, circularRef, space) {
    let decoded;
    try {
        // const pool: Map<any, boolean> = new Map();
        const pool = [];
        const json = JSON.stringify(value, function (key, value) {
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
    }
    catch (error) {
        // console.warn(`Serializer.encodeJson.error`, value, error);
    }
    return decoded;
}
export function encodeJsonWithOptions(circularRef, space) {
    return (value) => encodeJson(value, circularRef, space);
}
export function decodeJson(value) {
    let decoded;
    if (value) {
        try {
            decoded = JSON.parse(value);
        }
        catch (error) {
            // console.warn(`Serializer.decodeJson.error`, value, error);
        }
    }
    return decoded;
}
export function encodeBase64(value) {
    let encoded;
    try {
        encoded = isPlatformBrowser ? btoa(value) : Buffer.from(value).toString('base64');
    }
    catch (error) {
        encoded = value;
    }
    return encoded;
}
export function decodeBase64(value) {
    let decoded;
    try {
        decoded = isPlatformBrowser ? atob(value) : Buffer.from(value, 'base64').toString();
    }
    catch (error) {
        decoded = value;
    }
    return decoded;
}
