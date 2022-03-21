"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsToKey = void 0;
var tslib_1 = require("tslib");
var serializer_1 = tslib_1.__importStar(require("../serializer/serializer"));
var TransferService = /** @class */ (function () {
    function TransferService() {
    }
    TransferService.makeKey = function (base, params) {
        var paramsKey = params ? optionsToKey(params) : '';
        var key = "rxcomp-hydrate-".concat(base, "-").concat(paramsKey);
        key = key.replace(/(\s+)|(\W+)/g, function () {
            var matches = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                matches[_i] = arguments[_i];
            }
            return matches[1] ? '' : '_';
        });
        // console.log('TransferService.makeKey', key, base, paramsKey);
        return key;
    };
    TransferService.has = function (key) {
        var script = document.querySelector("#".concat(key));
        return script !== null;
    };
    TransferService.get = function (key) {
        var node = document.querySelector("#".concat(key));
        if (node && node.firstChild) {
            var json = node.firstChild.nodeValue;
            return json ? serializer_1.default.decode(json, [serializer_1.decodeJson]) : undefined;
        }
        else {
            return undefined;
        }
    };
    TransferService.set = function (key, value) {
        // console.log('TransferService.set', key, value);
        var json = serializer_1.default.encode(value, [serializer_1.encodeJson]);
        if (!json) {
            return;
        }
        var text = document.createTextNode(json);
        var node = document.querySelector("#".concat(key));
        if (!node) {
            node = document.createElement('script');
            node.setAttribute('id', key);
            node.setAttribute('type', 'text/template');
            // console.log('node', node!!, 'document', document!!, 'head', document.head!!);
            node.append(text);
            document.head.append(node);
        }
        else {
            node.replaceChild(text, node.firstChild);
        }
    };
    TransferService.remove = function (key) {
        var node = document.querySelector("#".concat(key));
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    };
    return TransferService;
}());
exports.default = TransferService;
function optionsToKey(v, s) {
    if (s === void 0) { s = ''; }
    if (typeof v === 'number') {
        s += '-' + v.toString();
    }
    else if (typeof v === 'string') {
        s += '-' + v.substr(0, 20);
    }
    else if (v && Array.isArray(v)) {
        s += '-' + v.map(function (v) { return optionsToKey(v); }).join('');
    }
    else if (v && typeof v === 'object') {
        s += '-' + Object.keys(v).map(function (k) { return k + optionsToKey(v[k]); }).join('-');
    }
    return s;
}
exports.optionsToKey = optionsToKey;
