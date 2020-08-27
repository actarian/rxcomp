import { isPlatformBrowser } from "../../platform";
export default class Serializer {
    static encode(value, encoders = [encodeJson]) {
        return encoders.reduce((p, c) => c(p), value);
    }
    static decode(value, decoders = [decodeJson]) {
        return decoders.reduce((p, c) => c(p), value);
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
    return isPlatformBrowser ? atob(value) : Buffer.from(value).toString('base64');
}
export function decodeBase64(value) {
    return isPlatformBrowser ? btoa(value) : Buffer.from(value, 'base64').toString();
}
