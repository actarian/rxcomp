/**
 * @license rxcomp v1.0.0-beta.5
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

import { BehaviorSubject, Subject, fromEvent } from 'rxjs';
import { takeUntil, tap, shareReplay } from 'rxjs/operators';

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

var RxCompElement = (function (_super) {
    __extends(RxCompElement, _super);
    function RxCompElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RxCompElement;
}(HTMLElement));
var RxCompText = (function (_super) {
    __extends(RxCompText, _super);
    function RxCompText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RxCompText;
}(Text));
var Factory = (function () {
    function Factory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    return Factory;
}());

var Directive = (function (_super) {
    __extends(Directive, _super);
    function Directive() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Directive;
}(Factory));

var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Component;
}(Factory));

var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
var Context = (function (_super) {
    __extends(Context, _super);
    function Context(instance, descriptors) {
        if (descriptors === void 0) { descriptors = {}; }
        var _this = _super.call(this) || this;
        descriptors = Context.mergeDescriptors(instance, instance, descriptors);
        descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
        Object.defineProperties(_this, descriptors);
        return _this;
    }
    Context.mergeDescriptors = function (source, instance, descriptors) {
        if (descriptors === void 0) { descriptors = {}; }
        var properties = Object.getOwnPropertyNames(source);
        var _loop_1 = function () {
            var key = properties.shift();
            if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
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

var Structure = (function (_super) {
    __extends(Structure, _super);
    function Structure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Structure;
}(Factory));

var ID = 0;
var CONTEXTS = {};
var NODES = {};
var Module = (function () {
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
        return instances;
    };
    Module.prototype.makeInstance = function (node, factory, selector, parentInstance, args) {
        var _this = this;
        if (parentInstance || node.parentNode) {
            var isComponent_1 = factory.prototype instanceof Component;
            var meta_1 = factory.meta;
            parentInstance = parentInstance || this.getParentInstance(node.parentNode);
            if (!parentInstance) {
                return;
            }
            var instance_1 = new (factory.bind.apply(factory, __spreadArrays([void 0], (args || []))))();
            var context = Module.makeContext(this, instance_1, parentInstance, node, factory, selector);
            Object.defineProperties(instance_1, {
                changes$: {
                    value: new BehaviorSubject(instance_1),
                    writable: false,
                    enumerable: false,
                },
                unsubscribe$: {
                    value: new Subject(),
                    writable: false,
                    enumerable: false,
                }
            });
            var initialized_1;
            var module_1 = this;
            instance_1.pushChanges = function () {
                this.changes$.next(this);
                if (isComponent_1) {
                    initialized_1 ? module_1.parse(node, instance_1) : setTimeout(function () { module_1.parse(node, instance_1); });
                }
                if (instance_1['onView']) {
                    instance_1['onView']();
                }
            };
            if (meta_1) {
                this.makeHosts(meta_1, instance_1, node);
                context.inputs = this.makeInputs(meta_1, instance_1);
                context.outputs = this.makeOutputs(meta_1, instance_1);
            }
            if (instance_1['onInit']) {
                instance_1['onInit']();
            }
            initialized_1 = true;
            if (parentInstance instanceof Factory && parentInstance.changes$) {
                parentInstance.changes$.pipe(takeUntil(instance_1.unsubscribe$)).subscribe(function (changes) {
                    if (meta_1) {
                        _this.resolveInputsOutputs(instance_1, changes);
                    }
                    if (instance_1['onChanges']) {
                        instance_1['onChanges'](changes);
                    }
                    instance_1.pushChanges();
                });
            }
            return instance_1;
        }
    };
    Module.prototype.makeContext = function (instance, parentInstance, node, selector) {
        var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
        return context;
    };
    Module.prototype.makeFunction = function (expression, params) {
        if (params === void 0) { params = ['$instance']; }
        if (expression) {
            expression = Module.parseExpression(expression);
            var args = params.join(',');
            var expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + args + ", $$module) {\n\t\t\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");
            return expression_func;
        }
        else {
            return function () { return null; };
        }
    };
    Module.prototype.getInstance = function (node) {
        if (node instanceof Document) {
            return window;
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
    Module.prototype.parseTextNode = function (node, instance) {
        var _this = this;
        var expressions = node.nodeExpressions;
        if (!expressions) {
            expressions = this.parseTextNodeExpression(node.nodeValue);
        }
        var replacedText = expressions.reduce(function (p, c) {
            var text;
            if (typeof c === 'function') {
                text = _this.resolve(c, instance, instance);
                if (text == undefined) {
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
        var output$ = new Subject().pipe(tap(function (event) {
            _this.resolve(outputFunction, parentInstance, event);
        }));
        output$.pipe(takeUntil(instance.unsubscribe$)).subscribe();
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
            for (var i = 0; i < nodeContexts.length; i++) {
                var context = nodeContexts[i];
                if (context.instance !== instance) {
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

var ClassDirective = (function (_super) {
    __extends(ClassDirective, _super);
    function ClassDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassDirective.prototype.onInit = function () {
        var _a = getContext(this), module = _a.module, node = _a.node;
        var expression = node.getAttribute('[class]');
        this.classFunction = module.makeFunction(expression);
    };
    ClassDirective.prototype.onChanges = function (changes) {
        var _a = getContext(this), module = _a.module, node = _a.node;
        var classList = module.resolve(this.classFunction, changes, this);
        for (var key in classList) {
            classList[key] ? node.classList.add(key) : node.classList.remove(key);
        }
    };
    return ClassDirective;
}(Directive));
ClassDirective.meta = {
    selector: "[[class]]",
};

var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];
var EventDirective = (function (_super) {
    __extends(EventDirective, _super);
    function EventDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EventDirective.prototype.onInit = function () {
        var _a = getContext(this), module = _a.module, node = _a.node, parentInstance = _a.parentInstance, selector = _a.selector;
        var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
        var event$ = this.event$ = fromEvent(node, event).pipe(shareReplay(1));
        var expression = node.getAttribute("(" + event + ")");
        if (expression) {
            var outputFunction_1 = module.makeFunction(expression, ['$event']);
            event$.pipe(takeUntil(this.unsubscribe$)).subscribe(function (event) {
                module.resolve(outputFunction_1, parentInstance, event);
            });
        }
        else {
            parentInstance[event + "$"] = event$;
        }
    };
    return EventDirective;
}(Directive));
EventDirective.meta = {
    selector: "[(" + EVENTS.join(')],[(') + ")]",
};

var ForItem = (function (_super) {
    __extends(ForItem, _super);
    function ForItem(key, $key, value, $value, index, count, parentInstance) {
        var _this = _super.call(this, parentInstance) || this;
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

var ForStructure = (function (_super) {
    __extends(ForStructure, _super);
    function ForStructure() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.instances = [];
        return _this;
    }
    ForStructure.prototype.onInit = function () {
        var _a = getContext(this), module = _a.module, node = _a.node;
        var forbegin = this.forbegin = document.createComment("*for begin");
        forbegin['rxcompId'] = node.rxcompId;
        node.parentNode.replaceChild(forbegin, node);
        var forend = this.forend = document.createComment("*for end");
        forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
        var expression = node.getAttribute('*for');
        node.removeAttribute('*for');
        var token = this.token = this.getExpressionToken(expression);
        this.forFunction = module.makeFunction(token.iterable);
    };
    ForStructure.prototype.onChanges = function (changes) {
        var context = getContext(this);
        var module = context.module;
        var node = context.node;
        var token = this.token;
        var result = module.resolve(this.forFunction, changes, this) || [];
        var isArray = Array.isArray(result);
        var array = isArray ? result : Object.keys(result);
        var total = array.length;
        var previous = this.instances.length;
        for (var i = 0; i < Math.max(previous, total); i++) {
            if (i < total) {
                var key = isArray ? i : array[i];
                var value = isArray ? array[key] : result[key];
                if (i < previous) {
                    var instance = this.instances[i];
                    instance[token.key] = key;
                    instance[token.value] = value;
                }
                else {
                    var clonedNode = node.cloneNode(true);
                    delete clonedNode['rxcompId'];
                    this.forend.parentNode.insertBefore(clonedNode, this.forend);
                    var args = [token.key, key, token.value, value, i, total, context.parentInstance];
                    var instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
                    if (instance) {
                        var forItemContext = getContext(instance);
                        module.compile(clonedNode, forItemContext.instance);
                        this.instances.push(instance);
                    }
                }
            }
            else {
                var instance = this.instances[i];
                var node_1 = getContext(instance).node;
                node_1.parentNode.removeChild(node_1);
                module.remove(node_1);
            }
        }
        this.instances.length = array.length;
    };
    ForStructure.prototype.getExpressionToken = function (expression) {
        if (expression === null) {
            throw ('invalid for');
        }
        if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
            throw ('invalid for');
        }
        var expressions = expression.split(';').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
        var forExpressions = expressions[0].split(' of ').map(function (x) { return x.trim(); });
        var value = forExpressions[0].replace(/\s*let\s*/, '');
        var iterable = forExpressions[1];
        var key = 'index';
        var keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
        if (keyValueMatches) {
            key = keyValueMatches[1];
            value = keyValueMatches[2];
        }
        if (expressions.length > 1) {
            var indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(function (x) { return x.trim(); });
            if (indexExpressions.length === 3) {
                key = indexExpressions[1];
            }
        }
        return { key: key, value: value, iterable: iterable };
    };
    return ForStructure;
}(Structure));
ForStructure.meta = {
    selector: '[*for]',
};

var HrefDirective = (function (_super) {
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

var IfStructure = (function (_super) {
    __extends(IfStructure, _super);
    function IfStructure() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.instances = [];
        return _this;
    }
    IfStructure.prototype.onInit = function () {
        var _a = getContext(this), module = _a.module, node = _a.node;
        var ifbegin = this.ifbegin = document.createComment("*if begin");
        ifbegin['rxcompId'] = node.rxcompId;
        node.parentNode.replaceChild(ifbegin, node);
        var ifend = this.ifend = document.createComment("*if end");
        ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
        var expression = node.getAttribute('*if');
        this.ifFunction = module.makeFunction(expression);
        var clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.node = clonedNode.cloneNode(true);
    };
    IfStructure.prototype.onChanges = function (changes) {
        var module = getContext(this).module;
        var value = module.resolve(this.ifFunction, changes, this);
        var node = this.node;
        if (value) {
            if (!node.parentNode) {
                this.ifend.parentNode.insertBefore(node, this.ifend);
                module.compile(node);
            }
        }
        else {
            if (node.parentNode) {
                module.remove(node, this);
                node.parentNode.removeChild(node);
                this.node = this.clonedNode.cloneNode(true);
            }
        }
    };
    return IfStructure;
}(Structure));
IfStructure.meta = {
    selector: '[*if]',
};

var InnerHtmlDirective = (function (_super) {
    __extends(InnerHtmlDirective, _super);
    function InnerHtmlDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InnerHtmlDirective.prototype.onChanges = function (changes) {
        var node = getContext(this).node;
        node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML;
    };
    return InnerHtmlDirective;
}(Directive));
InnerHtmlDirective.meta = {
    selector: "[innerHTML]",
    inputs: ['innerHTML'],
};

var Pipe = (function () {
    function Pipe() {
    }
    Pipe.transform = function (value) {
        return value;
    };
    return Pipe;
}());

var JsonPipe = (function (_super) {
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

var SrcDirective = (function (_super) {
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

var StyleDirective = (function (_super) {
    __extends(StyleDirective, _super);
    function StyleDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StyleDirective.prototype.onInit = function () {
        var _a = getContext(this), module = _a.module, node = _a.node;
        var expression = node.getAttribute('[style]');
        this.styleFunction = module.makeFunction(expression);
    };
    StyleDirective.prototype.onChanges = function (changes) {
        var _a = getContext(this), module = _a.module, node = _a.node;
        var style = module.resolve(this.styleFunction, changes, this);
        for (var key in style) {
            node.style.setProperty(key, style[key]);
        }
    };
    return StyleDirective;
}(Directive));
StyleDirective.meta = {
    selector: "[[style]]"
};

var CoreModule = (function (_super) {
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
var Platform = (function () {
    function Platform() {
    }
    Platform.bootstrap = function (moduleFactory) {
        var meta = this.resolveMeta(moduleFactory);
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
        root.pushChanges();
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

var Browser = (function (_super) {
    __extends(Browser, _super);
    function Browser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Browser;
}(Platform));

export { Browser, ClassDirective, Component, Context, CoreModule, Directive, EventDirective, ForItem, ForStructure, HrefDirective, IfStructure, InnerHtmlDirective, JsonPipe, Module, Pipe, Platform, SrcDirective, Structure, StyleDirective, getContext, getContextByNode, getHost };
//# sourceMappingURL=rxcomp.js.map
