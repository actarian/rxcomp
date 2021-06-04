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
var Module = /** @class */ (function () {
    function Module() {
        this.unsubscribe$ = new rxjs_1.Subject();
    }
    Module.prototype.compile = function (node, parentInstance, instances) {
        if (instances === void 0) { instances = []; }
        if (node.nodeType === 1) {
            var selectors = this.meta.selectors;
            var matches = [];
            // const childNodes: NodeListOf<ChildNode> = node.childNodes;
            // copying array to avoid multiple compilation
            var childNodes = Array.prototype.slice.call(node.childNodes);
            // const foundStructure : boolean = Module.matchSelectors(node as HTMLElement, selectors, matches);
            var foundStructure = false;
            for (var i = 0, len = selectors.length; i < len; i++) {
                var selectorResult = selectors[i](node);
                if (selectorResult) { // !== false
                    // match found
                    matches.push(selectorResult);
                    var factory = selectorResult.factory;
                    // structure found
                    if (factory.prototype instanceof structure_1.default) {
                        foundStructure = true;
                        break;
                    }
                    // injecting template
                    if (factory.prototype instanceof component_1.default && factory.meta.template) {
                        node.innerHTML = factory.meta.template;
                    }
                }
            }
            var nextParentInstance = parentInstance;
            for (var i = 0, len = matches.length; i < len; i++) {
                var match = matches[i];
                // console.log('makeInstance', parentInstance.constructor.name, match.factory.name);
                // make instance
                var instance = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
                if (instance) {
                    instances.push(instance);
                    // updating parentInstance
                    if (match.factory.prototype instanceof component_1.default) {
                        nextParentInstance = instance;
                    }
                }
            }
            /*
            matches.forEach((match: ISelectorResult) => {
                // console.log('makeInstance', parentInstance.constructor.name, match.factory.name);
                // make instance
                const instance: Factory | undefined = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
                if (instance) {
                    instances.push(instance);
                    // updating parentInstance
                    if (match.factory.prototype instanceof Component) {
                        nextParentInstance = instance;
                    }
                }
            });
            */
            if (!foundStructure) {
                // compiling childNodes
                for (var i = 0, len = childNodes.length; i < len; i++) {
                    this.compile(childNodes[i], nextParentInstance, instances);
                }
            }
        }
        return instances;
    };
    Module.prototype.makeInstance = function (node, factory, selector, parentInstance, args, inject) {
        var meta = factory.meta;
        // creating factory instance
        var instance = new (factory.bind.apply(factory, tslib_1.__spread([void 0], (args || []))))();
        // console.log(instance.constructor.name, parentInstance.constructor.name);
        // injecting custom properties
        if (inject != null) {
            for (var i = 0, keys = Object.keys(inject), len = keys.length; i < len; i++) {
                var key = keys[i];
                Object.defineProperty(instance, key, {
                    value: inject[key],
                    configurable: false,
                    enumerable: false,
                    writable: true,
                });
            }
            /*
            Object.keys(inject).forEach((key: string) => {
                // console.log('Module.makeInstance', key, inject[key]);
                Object.defineProperty(instance, key, {
                    value: inject[key],
                    configurable: false,
                    enumerable: false,
                    writable: true,
                });
            });
            */
        }
        // creating instance context
        var context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
        // creating component input and outputs
        if (instance instanceof context_1.default) {
            // skipping hosts, inputs & outputs
        }
        else {
            this.makeHosts(meta, instance, node);
            context.inputs = this.makeInputs(meta, node, factory);
            context.outputs = this.makeOutputs(meta, instance);
            // if (parentInstance instanceof Factory) {
            this.resolveInputsOutputs(instance, parentInstance);
            // }
        }
        // calling onInit event
        instance.onInit();
        // subscribe to parent changes
        if (parentInstance instanceof factory_1.default) {
            var childInstances = factory_1.getContext(parentInstance).childInstances;
            childInstances.push(instance);
            instance.onParentDidChange(parentInstance);
            /*
            parentInstance.changes$.pipe(
                // distinctUntilChanged(deepEqual),
                startWith(parentInstance),
                takeUntil(instance.unsubscribe$)
            ).subscribe(function (changes: Factory | Window) {
                instance.onParentDidChange(changes);
            });
            */
        }
        return instance;
    };
    Module.prototype.makeFunction = function (expression, params) {
        if (params === void 0) { params = ['$instance']; }
        var name = expression + '_' + params.join(',');
        var cachedExpressionFunction = factory_1.EXPRESSION_MAP.get(name);
        if (cachedExpressionFunction) {
            return cachedExpressionFunction;
        }
        else {
            this.meta.context = context_1.default; // !!!
            expression = Module.parseExpression(expression);
            var text = "\n\t\t\treturn (function (" + params.join(',') + ", $$module) {\n\t\t\t\tvar $$pipes = $$module.meta.pipes;\n\t\t\t\ttry {\n\t\t\t\t\tif (this.parentInstance) {\n\t\t\t\t\t\twith(this.parentInstance) {\n\t\t\t\t\t\t\twith(this) {\n\t\t\t\t\t\t\t\treturn " + expression + ";\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t} else {\n\t\t\t\t\t\twith(this) {\n\t\t\t\t\t\t\treturn " + expression + ";\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t} catch(error) {\n\t\t\t\t\t$$module.nextError(error, this, " + JSON.stringify(expression) + ", arguments);\n\t\t\t\t}\n\t\t\t}.bind(this)).apply(this, arguments);";
            /*
            const text: string = `
            return (function (${params.join(',')}, $$module) {
                var $$pipes = $$module.meta.pipes;
                return ${expression};
            }.bind(this)).apply(this, arguments);`;
            */
            /*
            const text: string = `
            return (function (${params.join(',')}, $$module) {
                var $$pipes = $$module.meta.pipes;
                try {
                    with(this) {
                        return ${expression};
                    }
                } catch(error) {
                    $$module.nextError(error, this, ${JSON.stringify(expression)}, arguments);
                }
            }.bind(this)).apply(this, arguments);`;
            */
            var expressionFunction = new Function(text);
            expressionFunction.expression = expression;
            factory_1.EXPRESSION_MAP.set(name, expressionFunction);
            return expressionFunction;
        }
    };
    Module.prototype.resolveInputsOutputs = function (instance, changes) {
        var context = factory_1.getContext(instance);
        var parentInstance = context.parentInstance;
        var inputs = context.inputs;
        for (var i = 0, keys = Object.keys(inputs), len = keys.length; i < len; i++) {
            var key = keys[i];
            var expression = inputs[key];
            var value = this.resolve(expression, parentInstance, instance);
            instance[key] = value;
        }
        /*
        Object.keys(inputs).forEach(key => {
            const expression: ExpressionFunction = inputs[key];
            const value: any = this.resolve(expression, parentInstance, instance);
            instance[key] = value;
        });
        */
    };
    Module.prototype.getInputAttributeExpression = function (key, node) {
        var expression = null;
        if (node.hasAttribute("[" + key + "]")) {
            expression = node.getAttribute("[" + key + "]");
            // console.log('Module.getInputAttributeExpression.expression.1', expression);
        }
        else if (node.hasAttribute("*" + key)) {
            expression = node.getAttribute("*" + key);
            // console.log('Module.getInputAttributeExpression.expression.2', expression);
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
                // console.log('Module.getInputAttributeExpression.expression.3', expression);
            }
        }
        // console.log('Module.getInputAttributeExpression.expression', expression);
        return expression;
    };
    Module.prototype.resolve = function (expression, parentInstance, payload) {
        // console.log('Module.resolve', expression, parentInstance, payload, getContext);
        return expression.apply(parentInstance, [payload, this]);
    };
    Module.prototype.parse = function (node, instance) {
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
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
            Module.deleteContext(node, keepContext);
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
            for (var i = 0, keys = Object.keys(meta.hosts), len = keys.length; i < len; i++) {
                var key = keys[i];
                var factory = meta.hosts[key];
                instance[key] = getHost(instance, factory, node);
            }
            /*
            Object.keys(meta.hosts).forEach((key: string) => {
                const factory: typeof Factory = meta.hosts![key];
                instance[key] = getHost(instance, factory, node);
            });
            */
        }
    };
    Module.prototype.makeInputs = function (meta, node, factory) {
        var inputs = {};
        if (meta.inputs) {
            for (var i = 0, len = meta.inputs.length; i < len; i++) {
                var key = meta.inputs[i];
                var expression = this.getInputAttributeExpression(key, node);
                if (expression) {
                    expression = factory.mapExpression(key, expression);
                    inputs[key] = this.makeFunction(expression);
                }
            }
            /*
            meta.inputs.forEach(key => {
                let expression: string | null = this.getInputAttributeExpression(key, node);
                if (expression) {
                    expression = factory.mapExpression(key, expression);
                    inputs[key] = this.makeFunction(expression);
                }
            });
            */
        }
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
        var context = { module: module, instance: instance, parentInstance: parentInstance, childInstances: [], node: node, factory: factory, selector: selector };
        var nodeContexts = factory_1.NODE_MAP.get(node);
        if (!nodeContexts) {
            nodeContexts = [];
            factory_1.NODE_MAP.set(node, nodeContexts);
        }
        nodeContexts.push(context);
        factory_1.CONTEXT_MAP.set(instance, context);
        return context;
    };
    Module.parseExpression = function (expression) {
        expression = Module.parseGroup(expression);
        expression = Module.parseOptionalChaining(expression);
        // expression = Module.parseThis(expression);
        return expression;
    };
    Module.parseGroup = function (expression) {
        var l = '┌';
        var r = '┘';
        var rx1 = /(\()([^\(\)]*)(\))/;
        while (rx1.test(expression)) {
            expression = expression.replace(rx1, function (m) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return "" + l + Module.parsePipes(args[1]) + r;
            });
        }
        expression = Module.parsePipes(expression);
        var rx2 = /(┌)|(┘)/g;
        expression = expression.replace(rx2, function (m) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return args[0] ? '(' : ')';
        });
        return expression;
    };
    Module.parsePipes = function (expression) {
        var rx = /(.*?[^\|])\|\s*(\w+)\s*([^\|]+)?/;
        while (rx.test(expression)) {
            expression = expression.replace(rx, function (m, value, name, expression) {
                var params = Module.parsePipeParams(expression);
                return "$$pipes." + name + ".transform(" + tslib_1.__spread([value], params) + ")";
            });
        }
        return expression;
    };
    Module.parsePipeParams = function (expression) {
        var params = [];
        // const rx = /:\s*(\[.+\]|\{.+\}|\(.+\)|\'.+\'|[^:\s]+)/g;
        var rx = /:\s*(\{.+\}|\(.+\)|[^:]+)/g;
        var match;
        while (match = rx.exec(expression)) {
            params.push(match[1]);
        }
        return params;
    };
    Module.parseOptionalChaining = function (expression) {
        var rx = /([\w|\.]+)(?:\?\.)+([\.|\w]+)/;
        while (rx.test(expression)) {
            expression = expression.replace(rx, function (m, a, b) {
                return a + " && " + a + "." + b;
            });
        }
        return expression;
    };
    Module.parseThis = function (expression) {
        var rx = /(\'.+\'|\[.+\]|\{.+\}|\$\$pipes)|([^\w.])([^\W\d])|^([^\W\d])/g;
        expression = expression.replace(rx, function (m, g1, g2, g3, g4) {
            if (g4) {
                return "this." + g4;
            }
            else if (g3) {
                return g2 + "this." + g3;
            }
            else {
                return g1;
            }
        });
        return expression;
    };
    /*
    protected static parseExpression__(expression: string): string {
        expression = Module.parseGroup__(expression);
        return Module.parseOptionalChaining__(expression);
    }
    protected static parseGroup__(expression: string): string {
        const l: string = '┌';
        const r: string = '┘';
        const rx1: RegExp = /(\()([^\(\)]*)(\))/;
        while (expression.match(rx1)) {
            expression = expression.replace(rx1, function (substring: string, ...args: any[]) {
                return `${l}${Module.parsePipes__(args[1])}${r}`;
            });
        }
        expression = Module.parsePipes__(expression);
        expression = expression.replace(/(┌)|(┘)/g, function (substring: string, ...args) {
            return args[0] ? '(' : ')';
        });
        return expression;
    }
    protected static parsePipes__(expression: string): string {
        const l: string = '┌';
        const r: string = '┘';
        const rx1: RegExp = /(.*?[^\|])\|([^\|]+)/;
        while (expression.match(rx1)) {
            expression = expression.replace(rx1, function (substring: string, ...args: any[]) {
                const value: string = args[0].trim();
                const params: string[] = Module.parsePipeParams__(args[1]);
                const func: string = params.shift()!.trim();
                return `$$pipes.${func}.transform${l}${[value, ...params]}${r}`;
            });
        }
        return expression;
    }
    protected static parsePipeParams__(expression: string): string[] {
        const segments: string[] = [];
        let i: number = 0,
            word: string = '',
            block: number = 0;
        const t: number = expression.length;
        while (i < t) {
            const c: string = expression.substr(i, 1);
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
            } else {
                word += c;
            }
            i++;
        }
        if (word.length) {
            segments.push(word.trim());
        }
        return segments;
    }
    protected static parseOptionalChaining__(expression: string): string {
        const regex: RegExp = /(\w+(\?\.))+([\.|\w]+)/g;
        let previous: string;
        expression = expression.replace(regex, function (substring: string, ...args: any[]) {
            const tokens: string[] = substring.split('?.');
            for (let i: number = 0, len: number = tokens.length - 1; i < len; i++) {
                const a: string = i > 0 ? `(${tokens[i]} = ${previous})` : tokens[i];
                const b: string = tokens[i + 1];
                previous = i > 0 ? `${a}.${b}` : `(${a} ? ${a}.${b} : void 0)`;
            }
            return previous || '';
        });
        return expression;
    }
    */
    Module.removeFromParentInstance = function (instance, parentInstance) {
        // console.log('Module.removeFromParentInstance', instance);
        if (parentInstance instanceof factory_1.default) {
            var parentContext = factory_1.getContext(parentInstance);
            if (parentContext) {
                var i = parentContext.childInstances.indexOf(instance);
                if (i !== -1) {
                    parentContext.childInstances.splice(i, 1);
                } /* else {
                    console.log('not found', instance, 'in', parentInstance);
                }*/
            }
        }
    };
    Module.deleteContext = function (node, keepContext) {
        var keepContexts = [];
        var nodeContexts = factory_1.NODE_MAP.get(node);
        if (nodeContexts) {
            nodeContexts.forEach(function (context) {
                if (context === keepContext) {
                    keepContexts.push(keepContext);
                }
                else {
                    var instance = context.instance;
                    // !!!
                    Module.removeFromParentInstance(instance, context.parentInstance);
                    // !!!
                    instance.unsubscribe$.next();
                    instance.unsubscribe$.complete();
                    instance.onDestroy();
                    factory_1.CONTEXT_MAP.delete(instance);
                }
            });
            if (keepContexts.length) {
                factory_1.NODE_MAP.set(node, keepContexts);
            }
            else {
                factory_1.NODE_MAP.delete(node);
            }
        }
        return keepContexts;
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
    var contexts = factory_1.NODE_MAP.get(element);
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
    var nodeContexts = factory_1.NODE_MAP.get(node);
    if (nodeContexts) {
        // console.log(nodeContexts);
        for (var i = 0, len = nodeContexts.length; i < len; i++) {
            var context = nodeContexts[i];
            if (context.instance !== instance) {
                // console.log(context.instance, instance);
                if (context.instance instanceof factory) {
                    return context.instance;
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
