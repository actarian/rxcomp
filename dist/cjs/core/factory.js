"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContext = exports.NODES = exports.CONTEXTS = void 0;
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
        /*
        // !!! PROXY
        const store: { [key: string]: any } = {};
        const handler: ProxyHandler<Factory> = {
            get: function (target: Factory, prop: string, receiver: any) {
                return target[prop];
            },
            set: function (target: Factory, prop: string | number | Symbol, value: any, receiver: any) {
                store[prop as string] = value;
                console.log('Factory updating store', prop, value, store);
                target[prop as string] = value;
                return true;
            }
        }
        const proxy = new Proxy(this, handler);
        console.log('proxy', proxy);
        */
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
    Factory.prototype.onParentDidChange = function (changes) {
        var module = getContext(this).module;
        // console.log('Component.onParentDidChange', changes);
        module.resolveInputsOutputs(this, changes);
        this.onChanges(changes);
        this.pushChanges();
    };
    Factory.getInputsTokens = function (instance) {
        return this.meta.inputs || [];
    };
    return Factory;
}());
exports.default = Factory;
function getContext(instance) {
    return exports.CONTEXTS[instance.rxcompId];
}
exports.getContext = getContext;
