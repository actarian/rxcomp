import { isPlatformBrowser } from "../../platform";
export default class Serializer {
    static encode(value, encoders = [encodeJson]) {
        return encoders.reduce((p, c) => c(p), value);
    }
    static decode(value, decoders = [decodeJson]) {
        return decoders.reduce((p, c) => c(p), value);
    }
}
export function encodeJson(value) {
    let decoded;
    try {
        const pool = new Map();
        const json = JSON.stringify(value, function (key, value) {
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
    }
    catch (error) {
        // console.warn(`Serializer.encodeJson.error`, value, error);
    }
    return decoded;
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
