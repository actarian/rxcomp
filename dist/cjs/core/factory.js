"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContext = exports.EXPRESSION_MAP = exports.NODE_MAP = exports.CONTEXT_MAP = exports.NODES = exports.CONTEXTS = void 0;
var rxjs_1 = require("rxjs");
exports.CONTEXTS = {};
exports.NODES = {};
exports.CONTEXT_MAP = new Map();
exports.NODE_MAP = new Map();
exports.EXPRESSION_MAP = new Map();
// console.log(CONTEXT_MAP, NODE_MAP, EXPRESSION_MAP);
var Factory = /** @class */ (function () {
    function Factory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
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
    Object.defineProperty(Factory.prototype, "unsubscribe$", {
        get: function () {
            if (!this.unsubscribe$_) {
                this.unsubscribe$_ = new rxjs_1.Subject();
            }
            return this.unsubscribe$_;
        },
        enumerable: false,
        configurable: true
    });
    // unsubscribe$: Subject<void> = new Subject();
    // changes$: Subject<Factory> = new Subject();
    // changes$: ReplaySubject<Factory> = new ReplaySubject(1);
    Factory.prototype.onInit = function () { };
    Factory.prototype.onChanges = function (changes) { };
    Factory.prototype.onView = function () { };
    Factory.prototype.onDestroy = function () { };
    Factory.prototype.pushChanges = function () {
        // const { module } = getContext(this);
        // if (module.instances) {
        var childInstances = getContext(this).childInstances;
        for (var i = 0, len = childInstances.length; i < len; i++) {
            childInstances[i].onParentDidChange(this);
        }
        // 	this.changes$.next(this);
        this.onView();
        // }
    };
    Factory.prototype.onParentDidChange = function (changes) {
        var module = getContext(this).module;
        // console.log('Component.onParentDidChange', changes);
        module.resolveInputsOutputs(this, changes);
        this.onChanges(changes);
        this.pushChanges();
    };
    Factory.mapExpression = function (key, expression) {
        return expression;
    };
    return Factory;
}());
exports.default = Factory;
function getContext(instance) {
    return exports.CONTEXT_MAP.get(instance);
}
exports.getContext = getContext;
