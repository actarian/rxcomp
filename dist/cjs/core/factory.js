"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
exports.CONTEXTS = {};
exports.NODES = {};
var Factory = /** @class */ (function () {
    function Factory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.rxcompId = -1;
        this.unsubscribe$ = new rxjs_1.Subject();
        this.changes$ = new rxjs_1.ReplaySubject(1);
    }
    Factory.prototype.onInit = function () { };
    Factory.prototype.onChanges = function (changes) { };
    Factory.prototype.onView = function () { };
    Factory.prototype.onDestroy = function () { };
    Factory.prototype.pushChanges = function () {
        var module = getContext(this).module;
        if (module.instances) {
            this.changes$.next(this);
            this.onView();
        }
    };
    return Factory;
}());
exports.default = Factory;
function getContext(instance) {
    return exports.CONTEXTS[instance.rxcompId];
}
exports.getContext = getContext;
