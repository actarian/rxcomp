/**
 * @license rxcomp v1.0.0-beta.5
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('test.pipes', ['rxjs', 'rxjs/operators'], factory) :
    (global = global || self, factory(global.rxjs, global.rxjs.operators));
}(this, (function (rxjs, operators) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var RxCompElement = /** @class */ (function (_super) {
        __extends(RxCompElement, _super);
        function RxCompElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RxCompElement;
    }(HTMLElement));
    var RxCompText = /** @class */ (function (_super) {
        __extends(RxCompText, _super);
        function RxCompText() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RxCompText;
    }(Text));
    var Factory = /** @class */ (function () {
        function Factory() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
        }
        return Factory;
    }());

    var Directive = /** @class */ (function (_super) {
        __extends(Directive, _super);
        function Directive() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Directive;
    }(Factory));

    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        function Component() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Component;
    }(Factory));

    var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
    var Context = /** @class */ (function (_super) {
        __extends(Context, _super);
        function Context(instance, descriptors) {
            if (descriptors === void 0) { descriptors = {}; }
            var _this = _super.call(this) || this;
            descriptors = Context.mergeDescriptors(instance, instance, descriptors);
            descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
            /*
            const subjects = {
                changes$: {
                    value: new BehaviorSubject(this),
                    writable: false,
                    enumerable: false,
                },
                unsubscribe$: {
                    value: new Subject(),
                    writable: false,
                    enumerable: false,
                }
            };
            */
            Object.defineProperties(_this, descriptors);
            return _this;
        }
        Context.mergeDescriptors = function (source, instance, descriptors) {
            if (descriptors === void 0) { descriptors = {}; }
            var properties = Object.getOwnPropertyNames(source);
            var _loop_1 = function () {
                var key = properties.shift();
                if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
                    // console.log('Context.mergeDescriptors', key, source[key]);
                    var descriptor = Object.getOwnPropertyDescriptor(source, key);
                    if (typeof descriptor.value == "function") {
                        descriptor.value = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return instance[key].apply(instance, args);
                        };
                    }
                    descriptors[key] = descriptor;
                }
            };
            while (properties.length) {
                _loop_1();
            }
            return descriptors;
        };
        return Context;
    }(Component));

    var Structure = /** @class */ (function (_super) {
        __extends(Structure, _super);
        function Structure() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Structure;
    }(Factory));

    var ID = 0;
    var CONTEXTS = {};
    var NODES = {};
    var Module = /** @class */ (function () {
        function Module() {
        }
        Module.prototype.compile = function (node, parentInstance) {
            var _this = this;
            var componentNode;
            var instances = Module.querySelectorsAll(node, this.meta.selectors, []).map(function (match) {
                if (componentNode && componentNode !== match.node) {
                    parentInstance = undefined;
                }
                var instance = _this.makeInstance(match.node, match.factory, match.selector, parentInstance);
                if (match.factory.prototype instanceof Component) {
                    componentNode = match.node;
                }
                return instance;
            }).filter(function (x) { return x; });
            // console.log('compile', instances, node, parentInstance);
            return instances;
        };
        Module.prototype.makeInstance = function (node, factory, selector, parentInstance, args) {
            var _this = this;
            if (parentInstance || node.parentNode) {
                var isComponent_1 = factory.prototype instanceof Component;
                var meta_1 = factory.meta;
                // console.log('meta', meta, factory);
                // collect parentInstance scope
                parentInstance = parentInstance || this.getParentInstance(node.parentNode);
                if (!parentInstance) {
                    return;
                }
                // creating factory instance
                var instance_1 = new (factory.bind.apply(factory, __spreadArrays([void 0], (args || []))))();
                // creating instance context
                var context = Module.makeContext(this, instance_1, parentInstance, node, factory, selector);
                // injecting changes$ and unsubscribe$ subjects
                Object.defineProperties(instance_1, {
                    changes$: {
                        value: new rxjs.BehaviorSubject(instance_1),
                        writable: false,
                        enumerable: false,
                    },
                    unsubscribe$: {
                        value: new rxjs.Subject(),
                        writable: false,
                        enumerable: false,
                    }
                });
                var initialized_1;
                // injecting instance pushChanges method
                var module_1 = this;
                instance_1.pushChanges = function () {
                    // console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
                    this.changes$.next(this);
                    // parse component text nodes
                    if (isComponent_1) {
                        // console.log('Module.parse', instance.constructor.name);
                        initialized_1 ? module_1.parse(node, instance_1) : setTimeout(function () { module_1.parse(node, instance_1); });
                    }
                    // calling onView event
                    if (instance_1['onView']) {
                        // console.log('onView', instance.constructor.name);
                        instance_1['onView']();
                    }
                };
                // creating component input and outputs
                // if (isComponent && meta) {
                if (meta_1) {
                    this.makeHosts(meta_1, instance_1, node);
                    context.inputs = this.makeInputs(meta_1, instance_1);
                    context.outputs = this.makeOutputs(meta_1, instance_1);
                }
                // calling onInit event
                if (instance_1['onInit']) {
                    instance_1['onInit']();
                }
                initialized_1 = true;
                // subscribe to parent changes
                if (parentInstance instanceof Factory && parentInstance.changes$) {
                    parentInstance.changes$.pipe(
                    // filter(() => node.parentNode),
                    // debounceTime(1),
                    /*
                    distinctUntilChanged(function(prev, curr) {
                        console.log(isComponent, context.inputs);
                        if (isComponent && meta && Object.keys(context.inputs).length === 0) {
                            return true; // same
                        } else {
                            return false;
                        }
                    }),
                    */
                    operators.takeUntil(instance_1.unsubscribe$)).subscribe(function (changes) {
                        // resolve component input outputs
                        // if (isComponent && meta) {
                        if (meta_1) {
                            _this.resolveInputsOutputs(instance_1, changes);
                        }
                        // calling onChanges event with parentInstance
                        if (instance_1['onChanges']) {
                            // console.log('onChanges', instance.constructor.name);
                            // console.log('onChanges', instance.constructor.meta.selector, changes);
                            instance_1['onChanges'](changes);
                        }
                        // push instance changes for subscribers
                        instance_1.pushChanges();
                    });
                }
                return instance_1;
            }
        };
        Module.prototype.makeContext = function (instance, parentInstance, node, selector) {
            var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
            // console.log('Module.makeContext', context, context.instance, context.node);
            return context;
        };
        Module.prototype.makeFunction = function (expression, params) {
            if (params === void 0) { params = ['$instance']; }
            if (expression) {
                expression = Module.parseExpression(expression);
                // console.log(expression);
                var args = params.join(',');
                var expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + args + ", $$module) {\n\t\t\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");
                // console.log(expression_func);
                return expression_func;
            }
            else {
                return function () { return null; };
            }
        };
        Module.prototype.getInstance = function (node) {
            if (node instanceof Document) {
                return window; // !!! window or global
            }
            var context = getContextByNode(node);
            if (context) {
                return context.instance;
            }
        };
        Module.prototype.getParentInstance = function (node) {
            var _this = this;
            return Module.traverseUp(node, function (node) {
                return _this.getInstance(node);
            });
        };
        Module.prototype.parse = function (node, instance) {
            for (var i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                if (child.nodeType === 1) {
                    var htmlNode = child;
                    var context = getContextByNode(htmlNode);
                    if (!context) {
                        this.parse(htmlNode, instance);
                    }
                }
                else if (child.nodeType === 3) {
                    var text = child;
                    this.parseTextNode(text, instance);
                }
            }
        };
        // reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
        Module.prototype.parseTextNode = function (node, instance) {
            var _this = this;
            var expressions = node.nodeExpressions;
            if (!expressions) {
                expressions = this.parseTextNodeExpression(node.nodeValue);
            }
            var replacedText = expressions.reduce(function (p, c) {
                var text;
                if (typeof c === 'function') { // instanceOf ExpressionFunction ?;
                    text = _this.resolve(c, instance, instance);
                    if (text == undefined) { // !!! keep == loose equality
                        text = '';
                    }
                }
                else {
                    text = c;
                }
                return p + text;
            }, '');
            if (node.nodeValue !== replacedText) {
                var textNode = document.createTextNode(replacedText);
                textNode.nodeExpressions = expressions;
                node.parentNode.replaceChild(textNode, node);
            }
        };
        Module.prototype.pushFragment = function (nodeValue, from, to, expressions) {
            var fragment = nodeValue.substring(from, to);
            expressions.push(fragment);
        };
        Module.prototype.parseTextNodeExpression = function (nodeValue) {
            var expressions = [];
            var regex = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
            var lastIndex = 0, matches;
            /*
            const pushFragment = function (from: number, to: number): void {
                const fragment = nodeValue.substring(from, to);
                expressions.push(fragment);
            };
            */
            while ((matches = regex.exec(nodeValue)) !== null) {
                var index = regex.lastIndex - matches[0].length;
                if (index > lastIndex) {
                    this.pushFragment(nodeValue, index, lastIndex, expressions);
                }
                lastIndex = regex.lastIndex;
                var expression = this.makeFunction(matches[1]);
                expressions.push(expression);
            }
            var length = nodeValue.length;
            if (length > lastIndex) {
                this.pushFragment(nodeValue, lastIndex, length, expressions);
            }
            return expressions;
        };
        Module.prototype.resolve = function (expression, parentInstance, payload) {
            // console.log(expression, parentInstance, payload);
            return expression.apply(parentInstance, [payload, this]);
        };
        Module.prototype.makeHosts = function (meta, instance, node) {
            if (meta.hosts) {
                Object.keys(meta.hosts).forEach(function (key) {
                    var factory = meta.hosts[key];
                    instance[key] = getHost(instance, factory, node);
                });
            }
        };
        Module.prototype.makeInput = function (instance, key) {
            var node = getContext(instance).node;
            var input, expression = null;
            if (node.hasAttribute(key)) {
                // const attribute = node.getAttribute(key).replace(/{{/g, '"+').replace(/}}/g, '+"');
                var attribute = node.getAttribute(key).replace(/({{)|(}})|(")/g, function (match, a, b, c) {
                    if (a) {
                        return '"+';
                    }
                    if (b) {
                        return '+"';
                    }
                    if (c) {
                        return '\"';
                    }
                });
                expression = "\"" + attribute + "\"";
            }
            else if (node.hasAttribute("[" + key + "]")) {
                expression = node.getAttribute("[" + key + "]");
            }
            if (expression !== null) {
                input = this.makeFunction(expression);
            }
            return input;
        };
        Module.prototype.makeInputs = function (meta, instance) {
            var _this = this;
            var inputs = {};
            if (meta.inputs) {
                meta.inputs.forEach(function (key, i) {
                    var input = _this.makeInput(instance, key);
                    if (input) {
                        inputs[key] = input;
                    }
                });
            }
            return inputs;
        };
        Module.prototype.makeOutput = function (instance, key) {
            var _this = this;
            var context = getContext(instance);
            var node = context.node;
            var parentInstance = context.parentInstance;
            var expression = node.getAttribute("(" + key + ")");
            var outputFunction = this.makeFunction(expression, ['$event']);
            var output$ = new rxjs.Subject().pipe(operators.tap(function (event) {
                _this.resolve(outputFunction, parentInstance, event);
            }));
            output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
            instance[key] = output$;
            return outputFunction;
        };
        Module.prototype.makeOutputs = function (meta, instance) {
            var _this = this;
            var outputs = {};
            if (meta.outputs) {
                meta.outputs.forEach(function (key, i) { return outputs[key] = _this.makeOutput(instance, key); });
            }
            return outputs;
        };
        Module.prototype.resolveInputsOutputs = function (instance, changes) {
            var context = getContext(instance);
            var parentInstance = context.parentInstance;
            var inputs = context.inputs;
            for (var key in inputs) {
                var inputFunction = inputs[key];
                var value = this.resolve(inputFunction, parentInstance, instance);
                instance[key] = value;
            }
            /*
            const outputs = context.outputs;
            for (let key in outputs) {
                const inpuoutputFunctiontFunction = outputs[key];
                const value = this.resolve(outputFunction, parentInstance, null);
                // console.log(`setted -> ${key}`, value);
            }
            */
        };
        Module.prototype.destroy = function () {
            this.remove(this.meta.node);
            this.meta.node.innerHTML = this.meta.nodeInnerHTML;
        };
        Module.prototype.remove = function (node, keepInstance) {
            var keepContext = keepInstance ? getContext(keepInstance) : undefined;
            Module.traverseDown(node, function (node) {
                var rxcompId = node.rxcompId;
                if (rxcompId) {
                    var keepContexts = Module.deleteContext(rxcompId, keepContext);
                    if (keepContexts.length === 0) {
                        delete node.rxcompId;
                    }
                }
            });
            return node;
        };
        Module.parseExpression = function (expression) {
            var l = '┌';
            var r = '┘';
            var rx1 = /(\()([^\(\)]*)(\))/;
            while (expression.match(rx1)) {
                expression = expression.replace(rx1, function () {
                    var g1 = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        g1[_i] = arguments[_i];
                    }
                    return "" + l + Module.parsePipes(g1[2]) + r;
                });
            }
            expression = Module.parsePipes(expression);
            expression = expression.replace(/(┌)|(┘)/g, function () {
                var g2 = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    g2[_i] = arguments[_i];
                }
                return g2[1] ? '(' : ')';
            });
            return Module.parseOptionalChaining(expression);
        };
        Module.parsePipes = function (expression) {
            var rx1 = /(.*?[^\|])\|([^\|]+)/;
            while (expression.match(rx1)) {
                expression = expression.replace(rx1, function (substring) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var value = args[0].trim();
                    var params = Module.parsePipeParams(args[1]);
                    var func = params.shift().trim();
                    return "$$pipes." + func + ".transform\u250C" + __spreadArrays([value], params) + "\u2518";
                });
            }
            return expression;
        };
        Module.parsePipeParams = function (expression) {
            var segments = [];
            var i = 0, word = '', block = 0;
            var t = expression.length;
            while (i < t) {
                var c = expression.substr(i, 1);
                if (c === '{' || c === '(' || c === '[') {
                    block++;
                }
                if (c === '}' || c === ')' || c === ']') {
                    block--;
                }
                if (c === ':' && block === 0) {
                    if (word.length) {
                        segments.push(word.trim());
                    }
                    word = '';
                }
                else {
                    word += c;
                }
                i++;
            }
            if (word.length) {
                segments.push(word.trim());
            }
            return segments;
        };
        Module.parseOptionalChaining = function (expression) {
            var regex = /(\w+(\?\.))+([\.|\w]+)/g;
            var previous;
            expression = expression.replace(regex, function (substring) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var tokens = substring.split('?.');
                for (var i = 0; i < tokens.length - 1; i++) {
                    var a = i > 0 ? "(" + tokens[i] + " = " + previous + ")" : tokens[i];
                    var b = tokens[i + 1];
                    previous = i > 0 ? a + "." + b : "(" + a + " ? " + a + "." + b + " : void 0)";
                }
                return previous || '';
            });
            return expression;
        };
        Module.makeContext = function (module, instance, parentInstance, node, factory, selector) {
            instance.rxcompId = ++ID;
            var context = { module: module, instance: instance, parentInstance: parentInstance, node: node, factory: factory, selector: selector };
            var rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
            var nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
            nodeContexts.push(context);
            CONTEXTS[instance.rxcompId] = context;
            return context;
        };
        Module.deleteContext = function (id, keepContext) {
            var keepContexts = [];
            var nodeContexts = NODES[id];
            if (nodeContexts) {
                nodeContexts.forEach(function (context) {
                    if (context === keepContext) {
                        keepContexts.push(keepContext);
                    }
                    else {
                        var instance = context.instance;
                        instance.unsubscribe$.next();
                        instance.unsubscribe$.complete();
                        if (instance['onDestroy']) {
                            instance['onDestroy']();
                            delete CONTEXTS[instance.rxcompId];
                        }
                    }
                });
                if (keepContexts.length) {
                    NODES[id] = keepContexts;
                }
                else {
                    delete NODES[id];
                }
            }
            return keepContexts;
        };
        Module.matchSelectors = function (node, selectors, results) {
            for (var i = 0; i < selectors.length; i++) {
                var match = selectors[i](node);
                if (match) {
                    var factory = match.factory;
                    if (factory.prototype instanceof Component && factory.meta.template) {
                        node.innerHTML = factory.meta.template;
                    }
                    results.push(match);
                    if (factory.prototype instanceof Structure) {
                        // console.log('Structure', node);
                        break;
                    }
                }
            }
            return results;
        };
        Module.querySelectorsAll = function (node, selectors, results) {
            if (node.nodeType === 1) {
                var matches = this.matchSelectors(node, selectors, []);
                results = results.concat(matches);
                var structure = matches.find(function (x) { return x.factory.prototype instanceof Structure; });
                if (structure) {
                    return results;
                }
                var childNodes = node.childNodes;
                for (var i = 0; i < childNodes.length; i++) {
                    results = this.querySelectorsAll(childNodes[i], selectors, results);
                }
            }
            return results;
        };
        Module.traverseUp = function (node, callback, i) {
            if (i === void 0) { i = 0; }
            if (!node) {
                return;
            }
            var result = callback(node, i);
            if (result) {
                return result;
            }
            return this.traverseUp(node.parentNode, callback, i + 1);
        };
        Module.traverseDown = function (node, callback, i) {
            if (i === void 0) { i = 0; }
            if (!node) {
                return;
            }
            var result = callback(node, i);
            if (result) {
                return result;
            }
            if (node.nodeType === 1) {
                var j = 0, t = node.childNodes.length;
                while (j < t && !result) {
                    result = this.traverseDown(node.childNodes[j], callback, i + 1);
                    j++;
                }
            }
            return result;
        };
        Module.traversePrevious = function (node, callback, i) {
            if (i === void 0) { i = 0; }
            if (!node) {
                return;
            }
            var result = callback(node, i);
            if (result) {
                return result;
            }
            return this.traversePrevious(node.previousSibling, callback, i + 1);
        };
        Module.traverseNext = function (node, callback, i) {
            if (i === void 0) { i = 0; }
            if (!node) {
                return;
            }
            var result = callback(node, i);
            if (result) {
                return result;
            }
            return this.traverseNext(node.nextSibling, callback, i + 1);
        };
        return Module;
    }());
    function getContext(instance) {
        return CONTEXTS[instance.rxcompId];
    }
    function getContextByNode(node) {
        var context;
        var rxcompId = node['rxcompId'];
        if (rxcompId) {
            var nodeContexts = NODES[rxcompId];
            if (nodeContexts) {
                context = nodeContexts.reduce(function (previous, current) {
                    if (current.factory.prototype instanceof Component) {
                        return current;
                    }
                    else if (current.factory.prototype instanceof Context) {
                        return previous ? previous : current;
                    }
                    else {
                        return previous;
                    }
                }, null);
                // console.log(node.rxcompId, context);
            }
        }
        return context;
    }
    function getHost(instance, factory, node) {
        if (!node) {
            node = getContext(instance).node;
        }
        if (node.rxcompId) {
            var nodeContexts = NODES[node.rxcompId];
            if (nodeContexts) {
                // console.log(nodeContexts);
                for (var i = 0; i < nodeContexts.length; i++) {
                    var context = nodeContexts[i];
                    if (context.instance !== instance) {
                        // console.log(context.instance, instance);
                        if (context.instance instanceof Factory) {
                            return context.instance;
                        }
                    }
                }
            }
        }
        if (node.parentNode) {
            return getHost(instance, factory, node.parentNode);
        }
    }

    var ClassDirective = /** @class */ (function (_super) {
        __extends(ClassDirective, _super);
        function ClassDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClassDirective.prototype.onInit = function () {
            var _a = getContext(this), module = _a.module, node = _a.node;
            var expression = node.getAttribute('[class]');
            this.classFunction = module.makeFunction(expression);
            // console.log('ClassDirective.onInit', this.classList, expression);
        };
        ClassDirective.prototype.onChanges = function (changes) {
            var _a = getContext(this), module = _a.module, node = _a.node;
            var classList = module.resolve(this.classFunction, changes, this);
            for (var key in classList) {
                classList[key] ? node.classList.add(key) : node.classList.remove(key);
            }
            // console.log('ClassDirective.onChanges', classList);
        };
        return ClassDirective;
    }(Directive));
    ClassDirective.meta = {
        selector: "[[class]]",
    };

    var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];
    var EventDirective = /** @class */ (function (_super) {
        __extends(EventDirective, _super);
        function EventDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EventDirective.prototype.onInit = function () {
            var _a = getContext(this), module = _a.module, node = _a.node, parentInstance = _a.parentInstance, selector = _a.selector;
            var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
            var event$ = this.event$ = rxjs.fromEvent(node, event).pipe(operators.shareReplay(1));
            var expression = node.getAttribute("(" + event + ")");
            if (expression) {
                var outputFunction_1 = module.makeFunction(expression, ['$event']);
                event$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
                    // console.log(parentInstance);
                    module.resolve(outputFunction_1, parentInstance, event);
                });
            }
            else {
                parentInstance[event + "$"] = event$;
            }
            // console.log('EventDirective.onInit', 'selector', selector, 'event', event);
        };
        return EventDirective;
    }(Directive));
    EventDirective.meta = {
        selector: "[(" + EVENTS.join(')],[(') + ")]",
    };

    var ForItem = /** @class */ (function (_super) {
        __extends(ForItem, _super);
        // !!! try with payload options { key, $key, value, $value, index, count } or use onInit()
        function ForItem(key, $key, value, $value, index, count, parentInstance) {
            var _this = 
            // console.log('ForItem', arguments);
            _super.call(this, parentInstance) || this;
            /*
            super(parentInstance, {
                [key]: {
                    get: function() {
                        return this.$key;
                    },
                    set: function(key) {
                        this.$key = key;
                    }
                },
                [value]: {
                    get: function() {
                        return this.$value;
                    },
                    set: function(value) {
                        this.$value = value;
                    }
                }
            });
            */
            _this[key] = $key;
            _this[value] = $value;
            _this.index = index;
            _this.count = count;
            return _this;
        }
        Object.defineProperty(ForItem.prototype, "first", {
            get: function () { return this.index === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ForItem.prototype, "last", {
            get: function () { return this.index === this.count - 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ForItem.prototype, "even", {
            get: function () { return this.index % 2 === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ForItem.prototype, "odd", {
            get: function () { return !this.even; },
            enumerable: true,
            configurable: true
        });
        return ForItem;
    }(Context));

    class ForStructure extends Structure {

    	onInit() {
    		const { module, node } = getContext(this);
    		const forbegin = this.forbegin = document.createComment(`*for begin`);
    		forbegin.rxcompId = node.rxcompId;
    		node.parentNode.replaceChild(forbegin, node);
    		const forend = this.forend = document.createComment(`*for end`);
    		forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
    		const expression = node.getAttribute('*for');
    		// this.expression = expression;
    		node.removeAttribute('*for');
    		const tokens = this.tokens = this.getExpressionTokens(expression);
    		this.forFunction = module.makeFunction(tokens.iterable);
    		this.instances = [];
    	}

    	onChanges(changes) {
    		const context = getContext(this);
    		const module = context.module;
    		const node = context.node;
    		// resolve
    		const tokens = this.tokens;
    		let result = module.resolve(this.forFunction, changes, this) || [];
    		const isArray = Array.isArray(result);
    		const array = isArray ? result : Object.keys(result);
    		const total = array.length;
    		const previous = this.instances.length;
    		// let nextSibling = this.forbegin.nextSibling;
    		for (let i = 0; i < Math.max(previous, total); i++) {
    			if (i < total) {
    				const key = isArray ? i : array[i];
    				const value = isArray ? array[key] : result[key];
    				if (i < previous) {
    					// update
    					const instance = this.instances[i];
    					instance[tokens.key] = key;
    					instance[tokens.value] = value;
    					/*
    					if (!nextSibling) {
    						const context = getContext(instance);
    						const node = context.node;
    						this.forend.parentNode.insertBefore(node, this.forend);
    					} else {
    						nextSibling = nextSibling.nextSibling;
    					}
    					*/
    				} else {
    					// create
    					const clonedNode = node.cloneNode(true);
    					delete clonedNode.rxcompId;
    					this.forend.parentNode.insertBefore(clonedNode, this.forend);
    					const args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?
    					const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
    					const forItemContext = getContext(instance);
    					// console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);
    					module.compile(clonedNode, forItemContext.instance);
    					// nextSibling = clonedNode.nextSibling;
    					this.instances.push(instance);
    				}
    			} else {
    				// remove
    				const instance = this.instances[i];
    				const { node } = getContext(instance);
    				node.parentNode.removeChild(node);
    				module.remove(node);
    			}
    		}
    		this.instances.length = array.length;
    		// console.log('ForStructure', this.instances, tokens);
    	}

    	getExpressionTokens(expression) {
    		if (expression === null) {
    			throw ('invalid for');
    		}
    		if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
    			throw ('invalid for');
    		}
    		const expressions = expression.split(';').map(x => x.trim()).filter(x => x !== '');
    		const forExpressions = expressions[0].split(' of ').map(x => x.trim());
    		let value = forExpressions[0].replace(/\s*let\s*/, '');
    		const iterable = forExpressions[1];
    		let key = 'index';
    		const keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
    		if (keyValueMatches) {
    			key = keyValueMatches[1];
    			value = keyValueMatches[2];
    		}
    		if (expressions.length > 1) {
    			const indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(x => x.trim());
    			if (indexExpressions.length === 3) {
    				key = indexExpressions[1];
    			}
    		}
    		return { key, value, iterable };
    	}

    }

    ForStructure.meta = {
    	selector: '[*for]',
    };

    var HrefDirective = /** @class */ (function (_super) {
        __extends(HrefDirective, _super);
        function HrefDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HrefDirective.prototype.onChanges = function (changes) {
            var node = getContext(this).node;
            node.setAttribute('href', this.href);
        };
        return HrefDirective;
    }(Directive));
    HrefDirective.meta = {
        selector: '[[href]]',
        inputs: ['href'],
    };

    class IfStructure extends Structure {

    	onInit() {
    		const { module, node } = getContext(this);
    		const ifbegin = this.ifbegin = document.createComment(`*if begin`);
    		ifbegin.rxcompId = node.rxcompId;
    		node.parentNode.replaceChild(ifbegin, node);
    		const ifend = this.ifend = document.createComment(`*if end`);
    		ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
    		const expression = node.getAttribute('*if');
    		this.ifFunction = module.makeFunction(expression);
    		const clonedNode = node.cloneNode(true);
    		clonedNode.removeAttribute('*if');
    		this.clonedNode = clonedNode;
    		this.node = clonedNode.cloneNode(true);
    		// console.log('IfStructure.expression', expression);
    	}

    	onChanges(changes) {
    		const { module } = getContext(this);
    		// console.log('IfStructure.onChanges', changes);
    		const value = module.resolve(this.ifFunction, changes, this);
    		const node = this.node;
    		if (value) {
    			if (!node.parentNode) {
    				this.ifend.parentNode.insertBefore(node, this.ifend);
    				module.compile(node);
    			}
    		} else {
    			if (node.parentNode) {
    				module.remove(node, this);
    				node.parentNode.removeChild(node);
    				this.node = this.clonedNode.cloneNode(true);
    			}
    		}
    	}

    }

    IfStructure.meta = {
    	selector: '[*if]',
    };

    var InnerHtmlDirective = /** @class */ (function (_super) {
        __extends(InnerHtmlDirective, _super);
        function InnerHtmlDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InnerHtmlDirective.prototype.onChanges = function (changes) {
            var node = getContext(this).node;
            node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML; // !!! keep == loose equality
        };
        return InnerHtmlDirective;
    }(Directive));
    InnerHtmlDirective.meta = {
        selector: "[innerHTML]",
        inputs: ['innerHTML'],
    };

    var Pipe = /** @class */ (function () {
        function Pipe() {
        }
        Pipe.transform = function (value) {
            return value;
        };
        return Pipe;
    }());

    var JsonPipe = /** @class */ (function (_super) {
        __extends(JsonPipe, _super);
        function JsonPipe() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        JsonPipe.transform = function (value) {
            return JSON.stringify(value, null, '\t');
        };
        return JsonPipe;
    }(Pipe));
    JsonPipe.meta = {
        name: 'json',
    };

    var SrcDirective = /** @class */ (function (_super) {
        __extends(SrcDirective, _super);
        function SrcDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SrcDirective.prototype.onChanges = function (changes) {
            var node = getContext(this).node;
            node.setAttribute('src', this.src);
        };
        return SrcDirective;
    }(Directive));
    SrcDirective.meta = {
        selector: '[[src]]',
        inputs: ['src'],
    };

    var StyleDirective = /** @class */ (function (_super) {
        __extends(StyleDirective, _super);
        function StyleDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StyleDirective.prototype.onInit = function () {
            var _a = getContext(this), module = _a.module, node = _a.node;
            var expression = node.getAttribute('[style]');
            this.styleFunction = module.makeFunction(expression);
            // console.log('StyleDirective.onInit', expression);
        };
        StyleDirective.prototype.onChanges = function (changes) {
            var _a = getContext(this), module = _a.module, node = _a.node;
            var style = module.resolve(this.styleFunction, changes, this);
            for (var key in style) {
                node.style.setProperty(key, style[key]);
            }
            // console.log('StyleDirective.onChanges', changes, style);
        };
        return StyleDirective;
    }(Directive));
    StyleDirective.meta = {
        selector: "[[style]]"
    };

    var CoreModule = /** @class */ (function (_super) {
        __extends(CoreModule, _super);
        function CoreModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return CoreModule;
    }(Module));
    var factories = [
        ClassDirective,
        EventDirective,
        ForStructure,
        HrefDirective,
        IfStructure,
        InnerHtmlDirective,
        SrcDirective,
        StyleDirective,
    ];
    var pipes = [
        JsonPipe,
    ];
    CoreModule.meta = {
        declarations: __spreadArrays(factories, pipes),
        exports: __spreadArrays(factories, pipes)
    };

    var ORDER = [Structure, Component, Directive];
    var Platform = /** @class */ (function () {
        function Platform() {
        }
        Platform.bootstrap = function (moduleFactory) {
            var meta = this.resolveMeta(moduleFactory);
            console.log(meta);
            var bootstrap = meta.bootstrap;
            if (!bootstrap) {
                throw ('missing bootstrap');
            }
            var node = meta.node = this.querySelector(bootstrap.meta.selector);
            if (!node) {
                throw ("missing node " + bootstrap.meta.selector);
            }
            meta.nodeInnerHTML = node.innerHTML;
            var pipes = meta.pipes = this.resolvePipes(meta);
            var factories = meta.factories = this.resolveFactories(meta);
            this.sortFactories(factories);
            factories.unshift(bootstrap);
            var selectors = meta.selectors = this.unwrapSelectors(factories);
            var module = new moduleFactory();
            module.meta = meta;
            var instances = module.compile(node, window);
            var root = instances[0];
            // if (root instanceof module.meta.bootstrap) {
            root.pushChanges();
            // }
            return module;
        };
        Platform.querySelector = function (selector) {
            return document.querySelector(selector);
        };
        Platform.resolveMeta = function (moduleFactory) {
            var _this = this;
            var meta = Object.assign({ imports: [], declarations: [], pipes: [], exports: [] }, moduleFactory.meta);
            meta.imports = meta.imports.map(function (moduleFactory) { return _this.resolveMeta(moduleFactory); });
            return meta;
        };
        Platform.resolvePipes = function (meta, exported) {
            var _this = this;
            var importedPipes = meta.imports.map(function (importMeta) { return _this.resolvePipes(importMeta, true); });
            var pipes = {};
            var pipeList = (exported ? meta.exports : meta.declarations).filter(function (x) { return x.prototype instanceof Pipe; });
            pipeList.forEach(function (pipeFactory) { return pipes[pipeFactory.meta.name] = pipeFactory; });
            return Object.assign.apply(Object, __spreadArrays([{}], importedPipes, [pipes]));
        };
        Platform.resolveFactories = function (meta, exported) {
            var _a;
            var _this = this;
            var importedFactories = meta.imports.map(function (importMeta) { return _this.resolveFactories(importMeta, true); });
            var factoryList = (exported ? meta.exports : meta.declarations).filter(function (x) { return (x.prototype instanceof Structure || x.prototype instanceof Component || x.prototype instanceof Directive); });
            return (_a = Array.prototype.concat).call.apply(_a, __spreadArrays([factoryList], importedFactories));
        };
        Platform.sortFactories = function (factories) {
            factories.sort(function (a, b) {
                var ai = ORDER.reduce(function (p, c, i) { return a.prototype instanceof c ? i : p; }, -1);
                var bi = ORDER.reduce(function (p, c, i) { return b.prototype instanceof c ? i : p; }, -1);
                // return ai - bi;
                var o = ai - bi;
                if (o === 0) {
                    return (a.meta.hosts ? 1 : 0) - (b.meta.hosts ? 1 : 0);
                }
                return o;
            });
        };
        Platform.getExpressions = function (selector) {
            var matchers = [];
            selector.replace(/\.([\w\-\_]+)|\[(.+?\]*)(\=)(.*?)\]|\[(.+?\]*)\]|([\w\-\_]+)/g, function (value, c1, a2, u3, v4, a5, e6) {
                if (c1) {
                    matchers.push(function (node) {
                        return node.classList.contains(c1);
                    });
                }
                if (a2) {
                    matchers.push(function (node) {
                        return (node.hasAttribute(a2) && node.getAttribute(a2) === v4) ||
                            (node.hasAttribute("[" + a2 + "]") && node.getAttribute("[" + a2 + "]") === v4);
                    });
                }
                if (a5) {
                    matchers.push(function (node) {
                        return node.hasAttribute(a5) || node.hasAttribute("[" + a5 + "]");
                    });
                }
                if (e6) {
                    matchers.push(function (node) {
                        return node.nodeName.toLowerCase() === e6.toLowerCase();
                    });
                }
                return '';
            });
            return matchers;
        };
        Platform.unwrapSelectors = function (factories) {
            var _this = this;
            var selectors = [];
            factories.forEach(function (factory) {
                factory.meta.selector.split(',').forEach(function (selector) {
                    selector = selector.trim();
                    var excludes = [];
                    var matchSelector = selector.replace(/\:not\((.+?)\)/g, function (value, unmatchSelector) {
                        excludes = _this.getExpressions(unmatchSelector);
                        return '';
                    });
                    var includes = _this.getExpressions(matchSelector);
                    selectors.push(function (node) {
                        var include = includes.reduce(function (result, e) {
                            return result && e(node);
                        }, true);
                        var exclude = excludes.reduce(function (result, e) {
                            return result || e(node);
                        }, false);
                        if (include && !exclude) {
                            return { node: node, factory: factory, selector: selector };
                        }
                        else {
                            return false;
                        }
                    });
                });
            });
            return selectors;
        };
        Platform.isBrowser = function () {
            return Boolean(window);
        };
        return Platform;
    }());

    var Browser = /** @class */ (function (_super) {
        __extends(Browser, _super);
        function Browser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Browser;
    }(Platform));

    var RootComponent = /** @class */ (function (_super) {
        __extends(RootComponent, _super);
        function RootComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.time = new Date();
            _this.value = 2;
            return _this;
        }
        return RootComponent;
    }(Component));
    RootComponent.meta = {
        selector: '[root-component]',
    };
    var TimePipe = /** @class */ (function (_super) {
        __extends(TimePipe, _super);
        function TimePipe() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TimePipe.transform = function (value, options) {
            var date = new Date(value);
            return date.getHours() + ":" + date.getMinutes();
        };
        return TimePipe;
    }(Pipe));
    TimePipe.meta = {
        name: 'time',
    };
    var MultPipe = /** @class */ (function (_super) {
        __extends(MultPipe, _super);
        function MultPipe() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MultPipe.transform = function (value, mult1, mult2) {
            if (mult1 === void 0) { mult1 = 2; }
            if (mult2 === void 0) { mult2 = 1; }
            return Number(value) * Number(mult1) * Number(mult2);
        };
        return MultPipe;
    }(Pipe));
    MultPipe.meta = {
        name: 'mult',
    };
    var AppModule = /** @class */ (function (_super) {
        __extends(AppModule, _super);
        function AppModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return AppModule;
    }(Module));
    AppModule.meta = {
        imports: [
            CoreModule
        ],
        declarations: [
            TimePipe,
            MultPipe
        ],
        bootstrap: RootComponent,
    };
    Browser.bootstrap(AppModule);

})));
//# sourceMappingURL=test.pipes.js.map
