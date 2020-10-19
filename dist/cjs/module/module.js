"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHost = exports.getContextByNode = exports.getParsableContextByElement = void 0;
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var component_1 = tslib_1.__importDefault(require("../core/component"));
var context_1 = tslib_1.__importDefault(require("../core/context"));
var factory_1 = tslib_1.__importStar(require("../core/factory"));
var structure_1 = tslib_1.__importDefault(require("../core/structure"));
var error_1 = require("../error/error");
var window_1 = require("../platform/common/window/window");
var ID = 0;
var Module = /** @class */ (function () {
    function Module() {
        this.unsubscribe$ = new rxjs_1.Subject();
    }
    Module.prototype.compile = function (node, parentInstance) {
        var _this = this;
        var componentNode;
        var instances = Module.querySelectorsAll(node, this.meta.selectors, []).map(function (match) {
            if (componentNode && componentNode !== match.node) {
                parentInstance = undefined;
            }
            var instance = _this.makeInstance(match.node, match.factory, match.selector, parentInstance);
            if (match.factory.prototype instanceof component_1.default) {
                componentNode = match.node;
            }
            return instance;
        }).filter(function (x) { return x !== undefined; });
        // instances.forEach(x => x.onInit());
        // console.log('compile', instances, node, parentInstance);
        return instances;
    };
    Module.prototype.makeInstance = function (node, factory, selector, parentInstance, args, inject, skipSubscription) {
        if (skipSubscription === void 0) { skipSubscription = false; }
        if (parentInstance || node.parentNode) {
            var meta = factory.meta;
            // collect parentInstance scope
            parentInstance = parentInstance || this.getParentInstance(node.parentNode);
            if (!parentInstance) {
                return undefined;
            }
            // creating factory instance
            var instance_1 = new (factory.bind.apply(factory, tslib_1.__spread([void 0], (args || []))))();
            // injecting custom properties
            if (inject) {
                Object.keys(inject).forEach(function (key) {
                    // console.log('Module.makeInstance', key, inject[key]);
                    Object.defineProperty(instance_1, key, {
                        value: inject[key],
                        configurable: false,
                        enumerable: false,
                        writable: true,
                    });
                });
            }
            // creating instance context
            var context = Module.makeContext(this, instance_1, parentInstance, node, factory, selector);
            // creating component input and outputs
            if (!(instance_1 instanceof context_1.default)) {
                this.makeHosts(meta, instance_1, node);
                context.inputs = this.makeInputs(meta, instance_1, node, factory);
                context.outputs = this.makeOutputs(meta, instance_1);
                // if (parentInstance instanceof Factory) {
                this.resolveInputsOutputs(instance_1, parentInstance);
                // }
            }
            // calling onInit event
            instance_1.onInit();
            // subscribe to parent changes
            if (!skipSubscription) {
                this.makeInstanceSubscription(instance_1, parentInstance);
            }
            return instance_1;
        }
        else {
            return undefined;
        }
    };
    Module.prototype.makeInstanceSubscription = function (instance, parentInstance) {
        if (parentInstance instanceof factory_1.default) {
            parentInstance.changes$.pipe(
            // distinctUntilChanged(deepEqual),
            operators_1.takeUntil(instance.unsubscribe$)).subscribe(function (changes) {
                instance.onParentDidChange(changes);
            });
        }
    };
    Module.prototype.makeFunction = function (expression, params) {
        if (params === void 0) { params = ['$instance']; }
        expression = Module.parseExpression(expression);
        var expressionFunction = "with(this) {\n\treturn (function (" + params.join(',') + ", $$module) {\n\t\ttry {\n\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\treturn " + expression + ";\n\t\t} catch(error) {\n\t\t\t$$module.nextError(error, this, " + JSON.stringify(expression) + ", arguments);\n\t\t}\n\t}.bind(this)).apply(this, arguments);\n}";
        // console.log('Module.makeFunction.expressionFunction', expressionFunction);
        var callback = new Function(expressionFunction);
        // return () => { return null; };
        callback.expression = expression;
        return callback;
    };
    Module.prototype.resolveInputsOutputs = function (instance, changes) {
        var context = factory_1.getContext(instance);
        var parentInstance = context.parentInstance;
        var inputs = context.inputs;
        for (var key in inputs) {
            var inputFunction = inputs[key];
            var value = this.resolve(inputFunction, parentInstance, instance);
            // console.log('Module.resolveInputsOutputs', 'key', key, 'inputFunction', inputFunction, 'value', value, 'parentInstance', parentInstance, 'instance', instance);
            instance[key] = value;
        }
    };
    Module.prototype.resolveAttribute = function (key, node) {
        var expression = null;
        if (node.hasAttribute("[" + key + "]")) {
            expression = node.getAttribute("[" + key + "]");
            // console.log('Module.resolveAttribute.expression.1', expression);
        }
        else if (node.hasAttribute("*" + key)) {
            expression = node.getAttribute("*" + key);
            // console.log('Module.resolveAttribute.expression.2', expression);
        }
        else if (node.hasAttribute(key)) {
            expression = node.getAttribute(key);
            if (expression) {
                var attribute = expression.replace(/({{)|(}})|(")/g, function (substring, a, b, c) {
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
                expression = "\"" + attribute + "\"";
                // console.log('Module.resolveAttribute.expression.3', expression);
            }
        }
        // console.log('Module.resolveAttribute.expression', expression);
        return expression;
    };
    Module.prototype.resolve = function (expression, parentInstance, payload) {
        // console.log('Module.resolve', expression, parentInstance, payload, getContext);
        return expression.apply(parentInstance, [payload, this]);
    };
    Module.prototype.parse = function (node, instance) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeType === 1) {
                var element = child;
                var context = getParsableContextByElement(element);
                if (!context) {
                    this.parse(element, instance);
                }
            }
            else if (child.nodeType === 3) {
                var text = child;
                this.parseTextNode(text, instance);
            }
        }
    };
    Module.prototype.remove = function (node, keepInstance) {
        var keepContext = keepInstance ? factory_1.getContext(keepInstance) : undefined;
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
    Module.prototype.destroy = function () {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.remove(this.meta.node);
        this.meta.node.innerHTML = this.meta.nodeInnerHTML;
    };
    Module.prototype.nextError = function (error, instance, expression, params) {
        var expressionError = new error_1.ExpressionError(error, this, instance, expression, params);
        error_1.nextError$.next(expressionError);
    };
    Module.prototype.makeContext = function (instance, parentInstance, node, selector) {
        var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
        // console.log('Module.makeContext', context, context.instance, context.node);
        return context;
    };
    Module.prototype.makeHosts = function (meta, instance, node) {
        if (meta.hosts) {
            Object.keys(meta.hosts).forEach(function (key) {
                var factory = meta.hosts[key];
                instance[key] = getHost(instance, factory, node);
            });
        }
    };
    /*
    protected makeInput(instance: Factory, key: string): ExpressionFunction | null {
        // console.log('Module.makeInput', 'key', key, 'instance', instance);
        const { node } = getContext(instance);
        let input: ExpressionFunction | null = null;
        const expression: string | null = this.resolveAttribute(key, node);
        if (expression) {
            instance[key] = typeof instance[key] === 'undefined' ? null : instance[key]; // !!! avoid throError undefined key
            input = this.makeFunction(expression);
        }
        // console.log('Module.makeInput', key, expression);
        return input;
    }
    */
    Module.prototype.makeInputs = function (meta, instance, node, factory) {
        var _this = this;
        var inputs = {};
        var inputsTokens = factory.getInputsTokens(instance, node, this);
        Object.keys(inputsTokens).forEach(function (key) {
            // !!! removed cause it throws error on instance setters
            // instance[key] = typeof instance[key] === 'undefined' ? null : instance[key]; // !!! avoid throError undefined key
            inputs[key] = _this.makeFunction(inputsTokens[key]);
        });
        /*
        factory.getInputsTokens(instance, node).forEach((key: string) => {
            const input = this.makeInput(instance, key);
            if (input) {
                inputs[key] = input;
            }
        });
        */
        return inputs;
    };
    Module.prototype.makeOutput = function (instance, key) {
        var _this = this;
        var context = factory_1.getContext(instance);
        var node = context.node;
        var parentInstance = context.parentInstance;
        var expression = node.getAttribute("(" + key + ")");
        var outputExpression = expression ? this.makeFunction(expression, ['$event']) : null;
        var output$ = new rxjs_1.Subject().pipe(operators_1.tap(function (event) {
            if (outputExpression) {
                // console.log(expression, parentInstance);
                _this.resolve(outputExpression, parentInstance, event);
            }
        }));
        output$.pipe(operators_1.takeUntil(instance.unsubscribe$)).subscribe();
        instance[key] = output$;
        return output$;
    };
    Module.prototype.makeOutputs = function (meta, instance) {
        var _this = this;
        var outputs = {};
        if (meta.outputs) {
            meta.outputs.forEach(function (key) {
                var output = _this.makeOutput(instance, key);
                if (output) {
                    outputs[key] = output;
                }
            });
        }
        return outputs;
    };
    Module.prototype.getInstance = function (node) {
        if (node === document) {
            return window_1.WINDOW; // (isPlatformBrowser ? window : global) as Window;
        }
        var context = getContextByNode(node);
        if (context) {
            return context.instance;
        }
        else {
            return undefined;
        }
    };
    Module.prototype.getParentInstance = function (node) {
        var _this = this;
        return Module.traverseUp(node, function (node) {
            return _this.getInstance(node);
        });
    };
    Module.prototype.parseTextNode = function (node, instance) {
        var _this = this;
        var expressions = node.nodeExpressions;
        if (!expressions) {
            expressions = this.parseTextNodeExpression(node.wholeText);
        }
        if (expressions.length) {
            var replacedText = expressions.reduce(function (p, c) {
                var text;
                if (typeof c === 'function') { // instanceOf ExpressionFunction ?;
                    // console.log('Module.parseTextNode', c, instance);
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
        }
        else {
            node.nodeExpressions = expressions;
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
            if (matches[1]) {
                var expression = this.makeFunction(matches[1]);
                expressions.push(expression);
            }
        }
        // console.log('Module.parseTextNodeExpression', regex.source, expressions, nodeValue);
        var length = nodeValue.length;
        if (length > lastIndex) {
            this.pushFragment(nodeValue, lastIndex, length, expressions);
        }
        if (expressions.find(function (x) { return typeof x === 'function'; })) {
            return expressions;
        }
        else {
            return [];
        }
    };
    Module.makeContext = function (module, instance, parentInstance, node, factory, selector) {
        instance.rxcompId = ++ID;
        var context = { module: module, instance: instance, parentInstance: parentInstance, node: node, factory: factory, selector: selector };
        var rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
        var nodeContexts = factory_1.NODES[rxcompNodeId] || (factory_1.NODES[rxcompNodeId] = []);
        nodeContexts.push(context);
        factory_1.CONTEXTS[instance.rxcompId] = context;
        return context;
    };
    Module.parseExpression = function (expression) {
        var l = '┌';
        var r = '┘';
        var rx1 = /(\()([^\(\)]*)(\))/;
        while (expression.match(rx1)) {
            expression = expression.replace(rx1, function (substring) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return "" + l + Module.parsePipes(args[1]) + r;
            });
        }
        expression = Module.parsePipes(expression);
        expression = expression.replace(/(┌)|(┘)/g, function (substring) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return args[0] ? '(' : ')';
        });
        return Module.parseOptionalChaining(expression);
    };
    Module.parsePipes = function (expression) {
        var l = '┌';
        var r = '┘';
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
                return "$$pipes." + func + ".transform" + l + tslib_1.__spread([value], params) + r;
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
    Module.deleteContext = function (id, keepContext) {
        var keepContexts = [];
        var nodeContexts = factory_1.NODES[id];
        if (nodeContexts) {
            nodeContexts.forEach(function (context) {
                if (context === keepContext) {
                    keepContexts.push(keepContext);
                }
                else {
                    var instance = context.instance;
                    instance.unsubscribe$.next();
                    instance.unsubscribe$.complete();
                    instance.onDestroy();
                    delete factory_1.CONTEXTS[instance.rxcompId];
                }
            });
            if (keepContexts.length) {
                factory_1.NODES[id] = keepContexts;
            }
            else {
                delete factory_1.NODES[id];
            }
        }
        return keepContexts;
    };
    Module.matchSelectors = function (node, selectors, results) {
        for (var i = 0; i < selectors.length; i++) {
            var selectorResult = selectors[i](node);
            if (selectorResult) {
                var factory = selectorResult.factory;
                if (factory.prototype instanceof component_1.default && factory.meta.template) {
                    node.innerHTML = factory.meta.template;
                }
                results.push(selectorResult);
                if (factory.prototype instanceof structure_1.default) {
                    // console.log('Structure', node);
                    break;
                }
            }
        }
        return results;
    };
    Module.querySelectorsAll = function (node, selectors, results) {
        if (node.nodeType === 1) {
            var selectorResults = this.matchSelectors(node, selectors, []);
            results = results.concat(selectorResults);
            var structure = selectorResults.find(function (x) { return x.factory.prototype instanceof structure_1.default; });
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
exports.default = Module;
function getParsableContextByElement(element) {
    var context;
    var rxcompId = element.rxcompId;
    if (rxcompId) {
        var contexts = factory_1.NODES[rxcompId];
        if (contexts) {
            context = contexts.reduce(function (previous, current) {
                if (current.instance instanceof context_1.default) {
                    return previous ? previous : current;
                }
                else if (current.instance instanceof component_1.default) {
                    return current;
                }
                else {
                    return previous;
                }
            }, undefined);
        }
        // context = contexts ? contexts.find(x => x.instance instanceof Component) : undefined;
    }
    return context;
}
exports.getParsableContextByElement = getParsableContextByElement;
function getContextByNode(element) {
    var context = getParsableContextByElement(element);
    if (context && context.factory.prototype instanceof structure_1.default) {
        return undefined;
    }
    return context;
}
exports.getContextByNode = getContextByNode;
function getHost(instance, factory, node) {
    if (!node) {
        node = factory_1.getContext(instance).node;
    }
    if (node.rxcompId) {
        var nodeContexts = factory_1.NODES[node.rxcompId];
        if (nodeContexts) {
            // console.log(nodeContexts);
            for (var i = 0; i < nodeContexts.length; i++) {
                var context = nodeContexts[i];
                if (context.instance !== instance) {
                    // console.log(context.instance, instance);
                    if (context.instance instanceof factory) {
                        return context.instance;
                    }
                }
            }
        }
    }
    if (node.parentNode) {
        return getHost(instance, factory, node.parentNode);
    }
    else {
        return undefined;
    }
}
exports.getHost = getHost;
/*
export function deepEqual(prev: any, curr: any, pool: any[] = []): boolean {
    let equal: boolean = typeof prev === typeof curr;
    if (prev && pool.indexOf(prev) === -1 && pool.indexOf(curr) === -1) {
        pool.push(prev, curr);
        const type = Array.isArray(curr) ? 'array' : typeof curr;
        switch (type) {
            case 'array':
                equal = prev.length === curr.length;
                equal = equal && prev.reduce((p: boolean, a: any[], i: number) => p && deepEqual(a, curr[i], pool), true);
                break;
            case 'object':
                if ('Symbol' in WINDOW && Symbol.iterator in prev) {
                    // || prev instanceof Map
                    equal = prev.size === curr.size;
                    const ea = prev.entries();
                    const eb = curr.entries();
                    for (let item = ea.next(); item.done !== true; item = ea.next()) {
                        const ia = item.value;
                        const ib = eb.next().value;
                        equal = equal && deepEqual(ia, ib, pool);
                    }
                } else {
                    const prevKeys = Object.keys(prev);
                    const currKeys = Object.keys(curr);
                    equal = prevKeys.length === currKeys.length;
                    equal = equal && prevKeys.reduce((p: boolean, k: string) => p && deepEqual(prev[k], curr[k], pool), true);
                }
                break;
            default:
                equal = prev === curr;
        }
    }
    // console.log(equal, prev, curr);
    return equal;
}
*/
