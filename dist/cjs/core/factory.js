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
    Factory.getInputsTokens = function (instance, node, module) {
        var _a;
        var inputs = {};
        (_a = this.meta.inputs) === null || _a === void 0 ? void 0 : _a.forEach(function (key) {
            var expression = module.resolveAttribute(key, node);
            /*
            let expression: string | null = null;
            if (node.hasAttribute(`[${key}]`)) {
                expression = node.getAttribute(`[${key}]`);
                // console.log('Factory.getInputsTokens.expression.1', expression);
            } else if (node.hasAttribute(`*${key}`)) {
                expression = node.getAttribute(`*${key}`);
                // console.log('Factory.getInputsTokens.expression.2', expression);
            } else if (node.hasAttribute(key)) {
                expression = node.getAttribute(key);
                if (expression) {
                    const attribute: string = expression.replace(/({{)|(}})|(")/g, function (substring: string, a, b, c) {
                        if (a) {
                            return '"+';
                        }
                        if (b) {
                            return '+"';
                        }
                        if (c) {
                            return '\"';
                        }
                        return '';
                    });
                    expression = `"${attribute}"`;
                    // console.log('Factory.getInputsTokens.expression.3', expression);
                }
            }
            */
            if (expression) {
                inputs[key] = expression;
            }
        });
        return inputs;
        // return this.meta.inputs || [];
    };
    return Factory;
}());
exports.default = Factory;
function getContext(instance) {
    return exports.CONTEXTS[instance.rxcompId];
}
exports.getContext = getContext;
