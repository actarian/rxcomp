define("core/factory", ["require", "exports", "tslib"], function (require, exports, tslib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RxCompElement = (function (_super) {
        tslib_1.__extends(RxCompElement, _super);
        function RxCompElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RxCompElement;
    }(HTMLElement));
    exports.RxCompElement = RxCompElement;
    var RxCompText = (function (_super) {
        tslib_1.__extends(RxCompText, _super);
        function RxCompText() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RxCompText;
    }(Text));
    exports.RxCompText = RxCompText;
    var Factory = (function () {
        function Factory() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
        }
        return Factory;
    }());
    exports.default = Factory;
});
define("core/directive", ["require", "exports", "tslib", "core/factory"], function (require, exports, tslib_2, factory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    factory_1 = tslib_2.__importDefault(factory_1);
    var Directive = (function (_super) {
        tslib_2.__extends(Directive, _super);
        function Directive() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Directive;
    }(factory_1.default));
    exports.default = Directive;
});
define("core/component", ["require", "exports", "tslib", "core/factory"], function (require, exports, tslib_3, factory_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    factory_2 = tslib_3.__importDefault(factory_2);
    var Component = (function (_super) {
        tslib_3.__extends(Component, _super);
        function Component() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Component;
    }(factory_2.default));
    exports.default = Component;
});
define("core/context", ["require", "exports", "tslib", "core/component"], function (require, exports, tslib_4, component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    component_1 = tslib_4.__importDefault(component_1);
    var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
    var Context = (function (_super) {
        tslib_4.__extends(Context, _super);
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
    }(component_1.default));
    exports.default = Context;
});
define("core/pipe", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Pipe = (function () {
        function Pipe() {
        }
        Pipe.transform = function (value) {
            return value;
        };
        return Pipe;
    }());
    exports.default = Pipe;
});
define("core/structure", ["require", "exports", "tslib", "core/factory"], function (require, exports, tslib_5, factory_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    factory_3 = tslib_5.__importDefault(factory_3);
    var Structure = (function (_super) {
        tslib_5.__extends(Structure, _super);
        function Structure() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Structure;
    }(factory_3.default));
    exports.default = Structure;
});
define("module/module", ["require", "exports", "tslib", "rxjs", "rxjs/operators", "core/component", "core/context", "core/factory", "core/structure"], function (require, exports, tslib_6, rxjs_1, operators_1, component_2, context_1, factory_4, structure_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    component_2 = tslib_6.__importDefault(component_2);
    context_1 = tslib_6.__importDefault(context_1);
    factory_4 = tslib_6.__importDefault(factory_4);
    structure_1 = tslib_6.__importDefault(structure_1);
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
                if (match.factory.prototype instanceof component_2.default) {
                    componentNode = match.node;
                }
                return instance;
            }).filter(function (x) { return x; });
            return instances;
        };
        Module.prototype.makeInstance = function (node, factory, selector, parentInstance, args) {
            var _this = this;
            if (parentInstance || node.parentNode) {
                var isComponent_1 = factory.prototype instanceof component_2.default;
                var meta_1 = factory.meta;
                parentInstance = parentInstance || this.getParentInstance(node.parentNode);
                if (!parentInstance) {
                    return;
                }
                var instance_1 = new (factory.bind.apply(factory, tslib_6.__spreadArrays([void 0], (args || []))))();
                var context = Module.makeContext(this, instance_1, parentInstance, node, factory, selector);
                Object.defineProperties(instance_1, {
                    changes$: {
                        value: new rxjs_1.BehaviorSubject(instance_1),
                        writable: false,
                        enumerable: false,
                    },
                    unsubscribe$: {
                        value: new rxjs_1.Subject(),
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
                if (parentInstance instanceof factory_4.default && parentInstance.changes$) {
                    parentInstance.changes$.pipe(operators_1.takeUntil(instance_1.unsubscribe$)).subscribe(function (changes) {
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
        ;
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
            var output$ = new rxjs_1.Subject().pipe(operators_1.tap(function (event) {
                _this.resolve(outputFunction, parentInstance, event);
            }));
            output$.pipe(operators_1.takeUntil(instance.unsubscribe$)).subscribe();
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
                    return "$$pipes." + func + ".transform\u250C" + tslib_6.__spreadArrays([value], params) + "\u2518";
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
                    ;
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
                    if (factory.prototype instanceof component_2.default && factory.meta.template) {
                        node.innerHTML = factory.meta.template;
                    }
                    results.push(match);
                    if (factory.prototype instanceof structure_1.default) {
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
                var structure = matches.find(function (x) { return x.factory.prototype instanceof structure_1.default; });
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
    function getContext(instance) {
        return CONTEXTS[instance.rxcompId];
    }
    exports.getContext = getContext;
    function getContextByNode(node) {
        var context;
        var rxcompId = node['rxcompId'];
        if (rxcompId) {
            var nodeContexts = NODES[rxcompId];
            if (nodeContexts) {
                context = nodeContexts.reduce(function (previous, current) {
                    if (current.factory.prototype instanceof component_2.default) {
                        return current;
                    }
                    else if (current.factory.prototype instanceof context_1.default) {
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
    exports.getContextByNode = getContextByNode;
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
                        if (context.instance instanceof factory_4.default) {
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
    exports.getHost = getHost;
});
define("class/class.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_7, directive_1, module_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_1 = tslib_7.__importDefault(directive_1);
    var ClassDirective = (function (_super) {
        tslib_7.__extends(ClassDirective, _super);
        function ClassDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClassDirective.prototype.onInit = function () {
            var _a = module_2.getContext(this), module = _a.module, node = _a.node;
            var expression = node.getAttribute('[class]');
            this.classFunction = module.makeFunction(expression);
        };
        ClassDirective.prototype.onChanges = function (changes) {
            var _a = module_2.getContext(this), module = _a.module, node = _a.node;
            var classList = module.resolve(this.classFunction, changes, this);
            for (var key in classList) {
                classList[key] ? node.classList.add(key) : node.classList.remove(key);
            }
        };
        return ClassDirective;
    }(directive_1.default));
    exports.default = ClassDirective;
    ClassDirective.meta = {
        selector: "[[class]]",
    };
});
define("event/event.directive", ["require", "exports", "tslib", "rxjs", "rxjs/operators", "core/directive", "module/module"], function (require, exports, tslib_8, rxjs_2, operators_2, directive_2, module_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_2 = tslib_8.__importDefault(directive_2);
    var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];
    var EventDirective = (function (_super) {
        tslib_8.__extends(EventDirective, _super);
        function EventDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EventDirective.prototype.onInit = function () {
            var _a = module_3.getContext(this), module = _a.module, node = _a.node, parentInstance = _a.parentInstance, selector = _a.selector;
            var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
            var event$ = this.event$ = rxjs_2.fromEvent(node, event).pipe(operators_2.shareReplay(1));
            var expression = node.getAttribute("(" + event + ")");
            if (expression) {
                var outputFunction_1 = module.makeFunction(expression, ['$event']);
                event$.pipe(operators_2.takeUntil(this.unsubscribe$)).subscribe(function (event) {
                    module.resolve(outputFunction_1, parentInstance, event);
                });
            }
            else {
                parentInstance[event + "$"] = event$;
            }
        };
        return EventDirective;
    }(directive_2.default));
    exports.default = EventDirective;
    EventDirective.meta = {
        selector: "[(" + EVENTS.join(')],[(') + ")]",
    };
});
define("for/for.item", ["require", "exports", "tslib", "core/context"], function (require, exports, tslib_9, context_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    context_2 = tslib_9.__importDefault(context_2);
    var ForItem = (function (_super) {
        tslib_9.__extends(ForItem, _super);
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
    }(context_2.default));
    exports.default = ForItem;
});
define("for/for.structure", ["require", "exports", "tslib", "core/structure", "module/module", "for/for.item"], function (require, exports, tslib_10, structure_2, module_4, for_item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    structure_2 = tslib_10.__importDefault(structure_2);
    for_item_1 = tslib_10.__importDefault(for_item_1);
    var ForStructure = (function (_super) {
        tslib_10.__extends(ForStructure, _super);
        function ForStructure() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.instances = [];
            return _this;
        }
        ForStructure.prototype.onInit = function () {
            var _a = module_4.getContext(this), module = _a.module, node = _a.node;
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
            var context = module_4.getContext(this);
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
                        var instance = module.makeInstance(clonedNode, for_item_1.default, context.selector, context.parentInstance, args);
                        if (instance) {
                            var forItemContext = module_4.getContext(instance);
                            module.compile(clonedNode, forItemContext.instance);
                            this.instances.push(instance);
                        }
                    }
                }
                else {
                    var instance = this.instances[i];
                    var node_1 = module_4.getContext(instance).node;
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
    }(structure_2.default));
    exports.default = ForStructure;
    ForStructure.meta = {
        selector: '[*for]',
    };
});
define("href/href.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_11, directive_3, module_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_3 = tslib_11.__importDefault(directive_3);
    var HrefDirective = (function (_super) {
        tslib_11.__extends(HrefDirective, _super);
        function HrefDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HrefDirective.prototype.onChanges = function (changes) {
            var node = module_5.getContext(this).node;
            node.setAttribute('href', this.href);
        };
        return HrefDirective;
    }(directive_3.default));
    exports.default = HrefDirective;
    HrefDirective.meta = {
        selector: '[[href]]',
        inputs: ['href'],
    };
});
define("if/if.structure", ["require", "exports", "tslib", "core/structure", "module/module"], function (require, exports, tslib_12, structure_3, module_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    structure_3 = tslib_12.__importDefault(structure_3);
    var IfStructure = (function (_super) {
        tslib_12.__extends(IfStructure, _super);
        function IfStructure() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.instances = [];
            return _this;
        }
        IfStructure.prototype.onInit = function () {
            var _a = module_6.getContext(this), module = _a.module, node = _a.node;
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
            var module = module_6.getContext(this).module;
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
    }(structure_3.default));
    exports.default = IfStructure;
    IfStructure.meta = {
        selector: '[*if]',
    };
});
define("inner-html/inner-html.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_13, directive_4, module_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_4 = tslib_13.__importDefault(directive_4);
    var InnerHtmlDirective = (function (_super) {
        tslib_13.__extends(InnerHtmlDirective, _super);
        function InnerHtmlDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InnerHtmlDirective.prototype.onChanges = function (changes) {
            var node = module_7.getContext(this).node;
            node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML;
        };
        return InnerHtmlDirective;
    }(directive_4.default));
    exports.default = InnerHtmlDirective;
    InnerHtmlDirective.meta = {
        selector: "[innerHTML]",
        inputs: ['innerHTML'],
    };
});
define("json/json.pipe", ["require", "exports", "tslib", "core/pipe"], function (require, exports, tslib_14, pipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    pipe_1 = tslib_14.__importDefault(pipe_1);
    var JsonPipe = (function (_super) {
        tslib_14.__extends(JsonPipe, _super);
        function JsonPipe() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        JsonPipe.transform = function (value) {
            return JSON.stringify(value, null, '\t');
        };
        return JsonPipe;
    }(pipe_1.default));
    exports.default = JsonPipe;
    JsonPipe.meta = {
        name: 'json',
    };
});
define("src/src.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_15, directive_5, module_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_5 = tslib_15.__importDefault(directive_5);
    var SrcDirective = (function (_super) {
        tslib_15.__extends(SrcDirective, _super);
        function SrcDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SrcDirective.prototype.onChanges = function (changes) {
            var node = module_8.getContext(this).node;
            node.setAttribute('src', this.src);
        };
        return SrcDirective;
    }(directive_5.default));
    exports.default = SrcDirective;
    SrcDirective.meta = {
        selector: '[[src]]',
        inputs: ['src'],
    };
});
define("style/style.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_16, directive_6, module_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_6 = tslib_16.__importDefault(directive_6);
    var StyleDirective = (function (_super) {
        tslib_16.__extends(StyleDirective, _super);
        function StyleDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StyleDirective.prototype.onInit = function () {
            var _a = module_9.getContext(this), module = _a.module, node = _a.node;
            var expression = node.getAttribute('[style]');
            this.styleFunction = module.makeFunction(expression);
        };
        StyleDirective.prototype.onChanges = function (changes) {
            var _a = module_9.getContext(this), module = _a.module, node = _a.node;
            var style = module.resolve(this.styleFunction, changes, this);
            for (var key in style) {
                node.style.setProperty(key, style[key]);
            }
        };
        return StyleDirective;
    }(directive_6.default));
    exports.default = StyleDirective;
    StyleDirective.meta = {
        selector: "[[style]]"
    };
});
define("core.module", ["require", "exports", "tslib", "class/class.directive", "event/event.directive", "for/for.structure", "href/href.directive", "if/if.structure", "inner-html/inner-html.directive", "json/json.pipe", "module/module", "src/src.directive", "style/style.directive"], function (require, exports, tslib_17, class_directive_1, event_directive_1, for_structure_1, href_directive_1, if_structure_1, inner_html_directive_1, json_pipe_1, module_10, src_directive_1, style_directive_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class_directive_1 = tslib_17.__importDefault(class_directive_1);
    event_directive_1 = tslib_17.__importDefault(event_directive_1);
    for_structure_1 = tslib_17.__importDefault(for_structure_1);
    href_directive_1 = tslib_17.__importDefault(href_directive_1);
    if_structure_1 = tslib_17.__importDefault(if_structure_1);
    inner_html_directive_1 = tslib_17.__importDefault(inner_html_directive_1);
    json_pipe_1 = tslib_17.__importDefault(json_pipe_1);
    module_10 = tslib_17.__importDefault(module_10);
    src_directive_1 = tslib_17.__importDefault(src_directive_1);
    style_directive_1 = tslib_17.__importDefault(style_directive_1);
    var CoreModule = (function (_super) {
        tslib_17.__extends(CoreModule, _super);
        function CoreModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return CoreModule;
    }(module_10.default));
    exports.default = CoreModule;
    var factories = [
        class_directive_1.default,
        event_directive_1.default,
        for_structure_1.default,
        href_directive_1.default,
        if_structure_1.default,
        inner_html_directive_1.default,
        src_directive_1.default,
        style_directive_1.default,
    ];
    var pipes = [
        json_pipe_1.default,
    ];
    CoreModule.meta = {
        declarations: tslib_17.__spreadArrays(factories, pipes),
        exports: tslib_17.__spreadArrays(factories, pipes)
    };
});
define("platform/platform", ["require", "exports", "tslib", "core/component", "core/directive", "core/pipe", "core/structure"], function (require, exports, tslib_18, component_3, directive_7, pipe_2, structure_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    component_3 = tslib_18.__importDefault(component_3);
    directive_7 = tslib_18.__importDefault(directive_7);
    pipe_2 = tslib_18.__importDefault(pipe_2);
    structure_4 = tslib_18.__importDefault(structure_4);
    var ORDER = [structure_4.default, component_3.default, directive_7.default];
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
            var pipeList = (exported ? meta.exports : meta.declarations).filter(function (x) { return x.prototype instanceof pipe_2.default; });
            pipeList.forEach(function (pipeFactory) { return pipes[pipeFactory.meta.name] = pipeFactory; });
            return Object.assign.apply(Object, tslib_18.__spreadArrays([{}], importedPipes, [pipes]));
        };
        Platform.resolveFactories = function (meta, exported) {
            var _a;
            var _this = this;
            var importedFactories = meta.imports.map(function (importMeta) { return _this.resolveFactories(importMeta, true); });
            var factoryList = (exported ? meta.exports : meta.declarations).filter(function (x) { return (x.prototype instanceof structure_4.default || x.prototype instanceof component_3.default || x.prototype instanceof directive_7.default); });
            return (_a = Array.prototype.concat).call.apply(_a, tslib_18.__spreadArrays([factoryList], importedFactories));
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
    exports.default = Platform;
});
define("platform/browser", ["require", "exports", "tslib", "platform/platform"], function (require, exports, tslib_19, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1 = tslib_19.__importDefault(platform_1);
    var Browser = (function (_super) {
        tslib_19.__extends(Browser, _super);
        function Browser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Browser;
    }(platform_1.default));
    exports.default = Browser;
});
define("rxcomp", ["require", "exports", "class/class.directive", "core.module", "core/component", "core/context", "core/directive", "core/pipe", "core/structure", "event/event.directive", "for/for.item", "for/for.structure", "href/href.directive", "if/if.structure", "inner-html/inner-html.directive", "json/json.pipe", "module/module", "platform/browser", "platform/platform", "src/src.directive", "style/style.directive"], function (require, exports, class_directive_2, core_module_1, component_4, context_3, directive_8, pipe_3, structure_5, event_directive_2, for_item_2, for_structure_2, href_directive_2, if_structure_2, inner_html_directive_2, json_pipe_2, module_11, browser_1, platform_2, src_directive_2, style_directive_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassDirective = class_directive_2.default;
    exports.CoreModule = core_module_1.default;
    exports.Component = component_4.default;
    exports.Context = context_3.default;
    exports.Directive = directive_8.default;
    exports.Pipe = pipe_3.default;
    exports.Structure = structure_5.default;
    exports.EventDirective = event_directive_2.default;
    exports.ForItem = for_item_2.default;
    exports.ForStructure = for_structure_2.default;
    exports.HrefDirective = href_directive_2.default;
    exports.IfStructure = if_structure_2.default;
    exports.InnerHtmlDirective = inner_html_directive_2.default;
    exports.JsonPipe = json_pipe_2.default;
    exports.Module = module_11.default;
    exports.getContext = module_11.getContext;
    exports.getContextByNode = module_11.getContextByNode;
    exports.getHost = module_11.getHost;
    exports.Browser = browser_1.default;
    exports.Platform = platform_2.default;
    exports.SrcDirective = src_directive_2.default;
    exports.StyleDirective = style_directive_2.default;
});
//# sourceMappingURL=rxcomp.js.map