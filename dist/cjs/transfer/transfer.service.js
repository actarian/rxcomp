"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TransferService = /** @class */ (function () {
    function TransferService() {
    }
    TransferService.makeKey = function (url, params) {
        url = params ? flatMap_(url, params) : url;
        url = url.replace(/(\W)/gm, '_');
        var key = "rxcomp_hydrate_" + url;
        // console.log('TransferService.makeKey', key, url);
        return key;
    };
    TransferService.has = function (key) {
        var script = document.querySelector("#" + key);
        return script !== null;
    };
    TransferService.get = function (key) {
        var node = document.querySelector("#" + key);
        if (node && node.firstChild) {
            var json = node.firstChild.nodeValue;
            return json ? this.decode(json) : undefined;
        }
        else {
            return undefined;
        }
    };
    TransferService.set = function (key, value) {
        var json = this.encode(value);
        if (!json) {
            return;
        }
        var text = document.createTextNode(json);
        var node = document.querySelector("#" + key);
        if (!node) {
            node = document.createElement('script');
            node.setAttribute('id', key);
            node.setAttribute('type', 'text/template');
            node.append(text);
            document.head.append(node);
        }
        else {
            node.replaceChild(text, node.firstChild);
        }
    };
    TransferService.remove = function (key) {
        var node = document.querySelector("#" + key);
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    };
    TransferService.encode = function (value) {
        var encodedJson = null;
        try {
            var cache_1 = new Map();
            var json = JSON.stringify(value, function (key, value) {
                if (typeof value === 'object' && value != null) {
                    if (cache_1.has(value)) {
                        // console.warn(`TransferService circular reference found, discard key "${key}"`);
                        return;
                    }
                    cache_1.set(value, true);
                }
                return value;
            });
            encodedJson = btoa(encodeURIComponent(json));
        }
        catch (error) {
            // console.warn('TransferService.encode.error', value, error);
        }
        return encodedJson;
    };
    TransferService.decode = function (encodedJson) {
        var value;
        if (encodedJson) {
            try {
                value = JSON.parse(decodeURIComponent(atob(encodedJson)));
            }
            catch (error) {
                // console.warn('TransferService.decode.error', encodedJson);
                value = encodedJson;
            }
        }
        return value;
    };
    return TransferService;
}());
exports.default = TransferService;
function flatMap_(s, x) {
    if (typeof x === 'number') {
        s += x.toString();
    }
    else if (typeof x === 'string') {
        s += x.substr(0, 10);
    }
    else if (x && typeof x === 'object') {
        s += '_' + Object.keys(x).map(function (k) { return k + '_' + flatMap_('', x[k]); }).join('_');
    }
    return s;
}
