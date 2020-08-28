"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase64 = exports.encodeBase64 = exports.decodeJson = exports.encodeJsonWithOptions = exports.encodeJson = void 0;
var platform_1 = require("../../platform");
var Serializer = /** @class */ (function () {
    function Serializer() {
    }
    Serializer.encode = function (value, encoders) {
        if (encoders === void 0) { encoders = [encodeJson]; }
        return encoders.reduce(function (p, c) { return c(p); }, value);
    };
    Serializer.decode = function (value, decoders) {
        if (decoders === void 0) { decoders = [decodeJson]; }
        return decoders.reduce(function (p, c) { return c(p); }, value);
    };
    Serializer.encodeJson = function (value) {
        return this.encode(value, [encodeJson]);
    };
    Serializer.decodeJson = function (value) {
        return this.decode(value, [decodeJson]);
    };
    Serializer.encodeBase64 = function (value) {
        return this.encode(value, [encodeJson, encodeBase64]);
    };
    Serializer.decodeBase64 = function (value) {
        return this.decode(value, [decodeBase64, decodeJson]);
    };
    return Serializer;
}());
exports.default = Serializer;
function encodeJson(value, circularRef, space) {
    var decoded;
    try {
        // const pool: Map<any, boolean> = new Map();
        var pool_1 = [];
        var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value != null) {
                // if (pool.has(value)) {
                if (pool_1.indexOf(value) !== -1) {
                    // console.warn(`Serializer.encodeJson.error`, `circular reference found, discard key "${key}"`);
                    return circularRef;
                }
                pool_1.push(value);
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
exports.encodeJson = encodeJson;
function encodeJsonWithOptions(circularRef, space) {
    return function (value) { return encodeJson(value, circularRef, space); };
}
exports.encodeJsonWithOptions = encodeJsonWithOptions;
function decodeJson(value) {
    var decoded;
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
exports.decodeJson = decodeJson;
function encodeBase64(value) {
    var encoded;
    try {
        encoded = platform_1.isPlatformBrowser ? btoa(value) : Buffer.from(value).toString('base64');
    }
    catch (error) {
        encoded = value;
    }
    return encoded;
}
exports.encodeBase64 = encodeBase64;
function decodeBase64(value) {
    var decoded;
    try {
        decoded = platform_1.isPlatformBrowser ? atob(value) : Buffer.from(value, 'base64').toString();
    }
    catch (error) {
        decoded = value;
    }
    return decoded;
}
exports.decodeBase64 = decodeBase64;
