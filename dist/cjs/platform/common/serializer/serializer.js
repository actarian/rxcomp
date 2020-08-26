"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase64 = exports.encodeBase64 = exports.decodeJson = exports.encodeJson = void 0;
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
    return Serializer;
}());
exports.default = Serializer;
function encodeJson(value) {
    var decoded;
    try {
        var pool_1 = new Map();
        var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value != null) {
                if (pool_1.has(value)) {
                    // console.warn(`Serializer.encodeJson.error`, `circular reference found, discard key "${key}"`);
                    return;
                }
                pool_1.set(value, true);
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
exports.encodeJson = encodeJson;
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
    return platform_1.isPlatformBrowser ? atob(value) : Buffer.from(value).toString('base64');
}
exports.encodeBase64 = encodeBase64;
function decodeBase64(value) {
    return platform_1.isPlatformBrowser ? btoa(value) : Buffer.from(value, 'base64').toString();
}
exports.decodeBase64 = decodeBase64;