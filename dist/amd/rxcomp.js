define("core/factory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RxCompElement extends HTMLElement {
    }
    exports.RxCompElement = RxCompElement;
    class RxCompText extends Text {
    }
    exports.RxCompText = RxCompText;
    class Factory {
        constructor(...args) {
        }
    }
    exports.default = Factory;
});
define("core/directive", ["require", "exports", "tslib", "core/factory"], function (require, exports, tslib_1, factory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    factory_1 = tslib_1.__importDefault(factory_1);
    class Directive extends factory_1.default {
    }
    exports.default = Directive;
});
define("core/component", ["require", "exports", "tslib", "core/factory"], function (require, exports, tslib_2, factory_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    factory_2 = tslib_2.__importDefault(factory_2);
    class Component extends factory_2.default {
    }
    exports.default = Component;
});
define("core/context", ["require", "exports", "tslib", "core/component"], function (require, exports, tslib_3, component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    component_1 = tslib_3.__importDefault(component_1);
    const RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
    class Context extends component_1.default {
        constructor(instance, descriptors = {}) {
            super();
            descriptors = Context.mergeDescriptors(instance, instance, descriptors);
            descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
            Object.defineProperties(this, descriptors);
        }
        static mergeDescriptors(source, instance, descriptors = {}) {
            const properties = Object.getOwnPropertyNames(source);
            while (properties.length) {
                let key = properties.shift();
                if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
                    const descriptor = Object.getOwnPropertyDescriptor(source, key);
                    if (typeof descriptor.value == "function") {
                        descriptor.value = (...args) => {
                            return instance[key].apply(instance, args);
                        };
                    }
                    descriptors[key] = descriptor;
                }
            }
            return descriptors;
        }
    }
    exports.default = Context;
});
define("core/pipe", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Pipe {
        static transform(value) {
            return value;
        }
    }
    exports.default = Pipe;
});
define("core/structure", ["require", "exports", "tslib", "core/factory"], function (require, exports, tslib_4, factory_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    factory_3 = tslib_4.__importDefault(factory_3);
    class Structure extends factory_3.default {
    }
    exports.default = Structure;
});
define("module/module", ["require", "exports", "tslib", "rxjs", "rxjs/operators", "core/component", "core/context", "core/factory", "core/structure"], function (require, exports, tslib_5, rxjs_1, operators_1, component_2, context_1, factory_4, structure_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    component_2 = tslib_5.__importDefault(component_2);
    context_1 = tslib_5.__importDefault(context_1);
    factory_4 = tslib_5.__importDefault(factory_4);
    structure_1 = tslib_5.__importDefault(structure_1);
    let ID = 0;
    const CONTEXTS = {};
    const NODES = {};
    class Module {
        compile(node, parentInstance) {
            let componentNode;
            const instances = Module.querySelectorsAll(node, this.meta.selectors, []).map(match => {
                if (componentNode && componentNode !== match.node) {
                    parentInstance = undefined;
                }
                const instance = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
                if (match.factory.prototype instanceof component_2.default) {
                    componentNode = match.node;
                }
                return instance;
            }).filter(x => x);
            return instances;
        }
        makeInstance(node, factory, selector, parentInstance, args) {
            if (parentInstance || node.parentNode) {
                const isComponent = factory.prototype instanceof component_2.default;
                const meta = factory.meta;
                parentInstance = parentInstance || this.getParentInstance(node.parentNode);
                if (!parentInstance) {
                    return;
                }
                const instance = new factory(...(args || []));
                const context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
                Object.defineProperties(instance, {
                    changes$: {
                        value: new rxjs_1.BehaviorSubject(instance),
                        writable: false,
                        enumerable: false,
                    },
                    unsubscribe$: {
                        value: new rxjs_1.Subject(),
                        writable: false,
                        enumerable: false,
                    }
                });
                let initialized;
                const module = this;
                instance.pushChanges = function () {
                    this.changes$.next(this);
                    if (isComponent) {
                        initialized ? module.parse(node, instance) : setTimeout(function () { module.parse(node, instance); });
                    }
                    if (instance['onView']) {
                        instance['onView']();
                    }
                };
                if (meta) {
                    this.makeHosts(meta, instance, node);
                    context.inputs = this.makeInputs(meta, instance);
                    context.outputs = this.makeOutputs(meta, instance);
                }
                if (instance['onInit']) {
                    instance['onInit']();
                }
                initialized = true;
                if (parentInstance instanceof factory_4.default && parentInstance.changes$) {
                    parentInstance.changes$.pipe(operators_1.takeUntil(instance.unsubscribe$)).subscribe(changes => {
                        if (meta) {
                            this.resolveInputsOutputs(instance, changes);
                        }
                        if (instance['onChanges']) {
                            instance['onChanges'](changes);
                        }
                        instance.pushChanges();
                    });
                }
                return instance;
            }
        }
        makeContext(instance, parentInstance, node, selector) {
            const context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
            return context;
        }
        makeFunction(expression, params = ['$instance']) {
            if (expression) {
                expression = Module.parseExpression(expression);
                const args = params.join(',');
                const expression_func = new Function(`with(this) {
				return (function (${args}, $$module) {
					const $$pipes = $$module.meta.pipes;
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`);
                return expression_func;
            }
            else {
                return () => { return null; };
            }
        }
        getInstance(node) {
            if (node instanceof Document) {
                return window;
            }
            const context = getContextByNode(node);
            if (context) {
                return context.instance;
            }
        }
        getParentInstance(node) {
            return Module.traverseUp(node, (node) => {
                return this.getInstance(node);
            });
        }
        parse(node, instance) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                if (child.nodeType === 1) {
                    const htmlNode = child;
                    const context = getContextByNode(htmlNode);
                    if (!context) {
                        this.parse(htmlNode, instance);
                    }
                }
                else if (child.nodeType === 3) {
                    const text = child;
                    this.parseTextNode(text, instance);
                }
            }
        }
        parseTextNode(node, instance) {
            let expressions = node.nodeExpressions;
            if (!expressions) {
                expressions = this.parseTextNodeExpression(node.nodeValue);
            }
            const replacedText = expressions.reduce((p, c) => {
                let text;
                if (typeof c === 'function') {
                    text = this.resolve(c, instance, instance);
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
                const textNode = document.createTextNode(replacedText);
                textNode.nodeExpressions = expressions;
                node.parentNode.replaceChild(textNode, node);
            }
        }
        pushFragment(nodeValue, from, to, expressions) {
            const fragment = nodeValue.substring(from, to);
            expressions.push(fragment);
        }
        ;
        parseTextNodeExpression(nodeValue) {
            const expressions = [];
            const regex = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
            let lastIndex = 0, matches;
            while ((matches = regex.exec(nodeValue)) !== null) {
                const index = regex.lastIndex - matches[0].length;
                if (index > lastIndex) {
                    this.pushFragment(nodeValue, index, lastIndex, expressions);
                }
                lastIndex = regex.lastIndex;
                const expression = this.makeFunction(matches[1]);
                expressions.push(expression);
            }
            const length = nodeValue.length;
            if (length > lastIndex) {
                this.pushFragment(nodeValue, lastIndex, length, expressions);
            }
            return expressions;
        }
        resolve(expression, parentInstance, payload) {
            return expression.apply(parentInstance, [payload, this]);
        }
        makeHosts(meta, instance, node) {
            if (meta.hosts) {
                Object.keys(meta.hosts).forEach((key) => {
                    const factory = meta.hosts[key];
                    instance[key] = getHost(instance, factory, node);
                });
            }
        }
        makeInput(instance, key) {
            const { node } = getContext(instance);
            let input, expression = null;
            if (node.hasAttribute(key)) {
                const attribute = node.getAttribute(key).replace(/({{)|(}})|(")/g, function (match, a, b, c) {
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
                expression = `"${attribute}"`;
            }
            else if (node.hasAttribute(`[${key}]`)) {
                expression = node.getAttribute(`[${key}]`);
            }
            if (expression !== null) {
                input = this.makeFunction(expression);
            }
            return input;
        }
        makeInputs(meta, instance) {
            const inputs = {};
            if (meta.inputs) {
                meta.inputs.forEach((key, i) => {
                    const input = this.makeInput(instance, key);
                    if (input) {
                        inputs[key] = input;
                    }
                });
            }
            return inputs;
        }
        makeOutput(instance, key) {
            const context = getContext(instance);
            const node = context.node;
            const parentInstance = context.parentInstance;
            const expression = node.getAttribute(`(${key})`);
            const outputFunction = this.makeFunction(expression, ['$event']);
            const output$ = new rxjs_1.Subject().pipe(operators_1.tap((event) => {
                this.resolve(outputFunction, parentInstance, event);
            }));
            output$.pipe(operators_1.takeUntil(instance.unsubscribe$)).subscribe();
            instance[key] = output$;
            return outputFunction;
        }
        makeOutputs(meta, instance) {
            const outputs = {};
            if (meta.outputs) {
                meta.outputs.forEach((key, i) => outputs[key] = this.makeOutput(instance, key));
            }
            return outputs;
        }
        resolveInputsOutputs(instance, changes) {
            const context = getContext(instance);
            const parentInstance = context.parentInstance;
            const inputs = context.inputs;
            for (let key in inputs) {
                const inputFunction = inputs[key];
                const value = this.resolve(inputFunction, parentInstance, instance);
                instance[key] = value;
            }
        }
        destroy() {
            this.remove(this.meta.node);
            this.meta.node.innerHTML = this.meta.nodeInnerHTML;
        }
        remove(node, keepInstance) {
            const keepContext = keepInstance ? getContext(keepInstance) : undefined;
            Module.traverseDown(node, (node) => {
                const rxcompId = node.rxcompId;
                if (rxcompId) {
                    const keepContexts = Module.deleteContext(rxcompId, keepContext);
                    if (keepContexts.length === 0) {
                        delete node.rxcompId;
                    }
                }
            });
            return node;
        }
        static parseExpression(expression) {
            const l = '┌';
            const r = '┘';
            const rx1 = /(\()([^\(\)]*)(\))/;
            while (expression.match(rx1)) {
                expression = expression.replace(rx1, function (...g1) {
                    return `${l}${Module.parsePipes(g1[2])}${r}`;
                });
            }
            expression = Module.parsePipes(expression);
            expression = expression.replace(/(┌)|(┘)/g, function (...g2) {
                return g2[1] ? '(' : ')';
            });
            return Module.parseOptionalChaining(expression);
        }
        static parsePipes(expression) {
            const l = '┌';
            const r = '┘';
            const rx1 = /(.*?[^\|])\|([^\|]+)/;
            while (expression.match(rx1)) {
                expression = expression.replace(rx1, function (substring, ...args) {
                    const value = args[0].trim();
                    const params = Module.parsePipeParams(args[1]);
                    const func = params.shift().trim();
                    return `$$pipes.${func}.transform┌${[value, ...params]}┘`;
                });
            }
            return expression;
        }
        static parsePipeParams(expression) {
            const segments = [];
            let i = 0, word = '', block = 0;
            const t = expression.length;
            while (i < t) {
                const c = expression.substr(i, 1);
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
        }
        static parseOptionalChaining(expression) {
            const regex = /(\w+(\?\.))+([\.|\w]+)/g;
            let previous;
            expression = expression.replace(regex, function (substring, ...args) {
                const tokens = substring.split('?.');
                for (let i = 0; i < tokens.length - 1; i++) {
                    const a = i > 0 ? `(${tokens[i]} = ${previous})` : tokens[i];
                    const b = tokens[i + 1];
                    previous = i > 0 ? `${a}.${b}` : `(${a} ? ${a}.${b} : void 0)`;
                }
                return previous || '';
            });
            return expression;
        }
        static makeContext(module, instance, parentInstance, node, factory, selector) {
            instance.rxcompId = ++ID;
            const context = { module, instance, parentInstance, node, factory, selector };
            const rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
            const nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
            nodeContexts.push(context);
            CONTEXTS[instance.rxcompId] = context;
            return context;
        }
        static deleteContext(id, keepContext) {
            const keepContexts = [];
            const nodeContexts = NODES[id];
            if (nodeContexts) {
                nodeContexts.forEach(context => {
                    if (context === keepContext) {
                        keepContexts.push(keepContext);
                    }
                    else {
                        const instance = context.instance;
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
        }
        static matchSelectors(node, selectors, results) {
            for (let i = 0; i < selectors.length; i++) {
                const match = selectors[i](node);
                if (match) {
                    const factory = match.factory;
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
        }
        static querySelectorsAll(node, selectors, results) {
            if (node.nodeType === 1) {
                const matches = this.matchSelectors(node, selectors, []);
                results = results.concat(matches);
                const structure = matches.find(x => x.factory.prototype instanceof structure_1.default);
                if (structure) {
                    return results;
                }
                const childNodes = node.childNodes;
                for (let i = 0; i < childNodes.length; i++) {
                    results = this.querySelectorsAll(childNodes[i], selectors, results);
                }
            }
            return results;
        }
        static traverseUp(node, callback, i = 0) {
            if (!node) {
                return;
            }
            const result = callback(node, i);
            if (result) {
                return result;
            }
            return this.traverseUp(node.parentNode, callback, i + 1);
        }
        static traverseDown(node, callback, i = 0) {
            if (!node) {
                return;
            }
            let result = callback(node, i);
            if (result) {
                return result;
            }
            if (node.nodeType === 1) {
                let j = 0, t = node.childNodes.length;
                while (j < t && !result) {
                    result = this.traverseDown(node.childNodes[j], callback, i + 1);
                    j++;
                }
            }
            return result;
        }
        static traversePrevious(node, callback, i = 0) {
            if (!node) {
                return;
            }
            const result = callback(node, i);
            if (result) {
                return result;
            }
            return this.traversePrevious(node.previousSibling, callback, i + 1);
        }
        static traverseNext(node, callback, i = 0) {
            if (!node) {
                return;
            }
            const result = callback(node, i);
            if (result) {
                return result;
            }
            return this.traverseNext(node.nextSibling, callback, i + 1);
        }
    }
    exports.default = Module;
    function getContext(instance) {
        return CONTEXTS[instance.rxcompId];
    }
    exports.getContext = getContext;
    function getContextByNode(node) {
        let context;
        const rxcompId = node['rxcompId'];
        if (rxcompId) {
            const nodeContexts = NODES[rxcompId];
            if (nodeContexts) {
                context = nodeContexts.reduce((previous, current) => {
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
            const nodeContexts = NODES[node.rxcompId];
            if (nodeContexts) {
                for (let i = 0; i < nodeContexts.length; i++) {
                    const context = nodeContexts[i];
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
define("class/class.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_6, directive_1, module_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_1 = tslib_6.__importDefault(directive_1);
    class ClassDirective extends directive_1.default {
        onInit() {
            const { module, node } = module_1.getContext(this);
            const expression = node.getAttribute('[class]');
            this.classFunction = module.makeFunction(expression);
        }
        onChanges(changes) {
            const { module, node } = module_1.getContext(this);
            const classList = module.resolve(this.classFunction, changes, this);
            for (let key in classList) {
                classList[key] ? node.classList.add(key) : node.classList.remove(key);
            }
        }
    }
    exports.default = ClassDirective;
    ClassDirective.meta = {
        selector: `[[class]]`,
    };
});
define("event/event.directive", ["require", "exports", "tslib", "rxjs", "rxjs/operators", "core/directive", "module/module"], function (require, exports, tslib_7, rxjs_2, operators_2, directive_2, module_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_2 = tslib_7.__importDefault(directive_2);
    const EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];
    class EventDirective extends directive_2.default {
        onInit() {
            const { module, node, parentInstance, selector } = module_2.getContext(this);
            const event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
            const event$ = this.event$ = rxjs_2.fromEvent(node, event).pipe(operators_2.shareReplay(1));
            const expression = node.getAttribute(`(${event})`);
            if (expression) {
                const outputFunction = module.makeFunction(expression, ['$event']);
                event$.pipe(operators_2.takeUntil(this.unsubscribe$)).subscribe(event => {
                    module.resolve(outputFunction, parentInstance, event);
                });
            }
            else {
                parentInstance[`${event}$`] = event$;
            }
        }
    }
    exports.default = EventDirective;
    EventDirective.meta = {
        selector: `[(${EVENTS.join(')],[(')})]`,
    };
});
define("for/for.item", ["require", "exports", "tslib", "core/context"], function (require, exports, tslib_8, context_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    context_2 = tslib_8.__importDefault(context_2);
    class ForItem extends context_2.default {
        constructor(key, $key, value, $value, index, count, parentInstance) {
            super(parentInstance);
            this[key] = $key;
            this[value] = $value;
            this.index = index;
            this.count = count;
        }
        get first() { return this.index === 0; }
        get last() { return this.index === this.count - 1; }
        get even() { return this.index % 2 === 0; }
        get odd() { return !this.even; }
    }
    exports.default = ForItem;
});
define("for/for.structure", ["require", "exports", "tslib", "core/structure", "module/module", "for/for.item"], function (require, exports, tslib_9, structure_2, module_3, for_item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    structure_2 = tslib_9.__importDefault(structure_2);
    for_item_1 = tslib_9.__importDefault(for_item_1);
    class ForStructure extends structure_2.default {
        constructor() {
            super(...arguments);
            this.instances = [];
        }
        onInit() {
            const { module, node } = module_3.getContext(this);
            const forbegin = this.forbegin = document.createComment(`*for begin`);
            forbegin['rxcompId'] = node.rxcompId;
            node.parentNode.replaceChild(forbegin, node);
            const forend = this.forend = document.createComment(`*for end`);
            forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
            const expression = node.getAttribute('*for');
            node.removeAttribute('*for');
            const token = this.token = this.getExpressionToken(expression);
            this.forFunction = module.makeFunction(token.iterable);
        }
        onChanges(changes) {
            const context = module_3.getContext(this);
            const module = context.module;
            const node = context.node;
            const token = this.token;
            let result = module.resolve(this.forFunction, changes, this) || [];
            const isArray = Array.isArray(result);
            const array = isArray ? result : Object.keys(result);
            const total = array.length;
            const previous = this.instances.length;
            for (let i = 0; i < Math.max(previous, total); i++) {
                if (i < total) {
                    const key = isArray ? i : array[i];
                    const value = isArray ? array[key] : result[key];
                    if (i < previous) {
                        const instance = this.instances[i];
                        instance[token.key] = key;
                        instance[token.value] = value;
                    }
                    else {
                        const clonedNode = node.cloneNode(true);
                        delete clonedNode['rxcompId'];
                        this.forend.parentNode.insertBefore(clonedNode, this.forend);
                        const args = [token.key, key, token.value, value, i, total, context.parentInstance];
                        const instance = module.makeInstance(clonedNode, for_item_1.default, context.selector, context.parentInstance, args);
                        if (instance) {
                            const forItemContext = module_3.getContext(instance);
                            module.compile(clonedNode, forItemContext.instance);
                            this.instances.push(instance);
                        }
                    }
                }
                else {
                    const instance = this.instances[i];
                    const { node } = module_3.getContext(instance);
                    node.parentNode.removeChild(node);
                    module.remove(node);
                }
            }
            this.instances.length = array.length;
        }
        getExpressionToken(expression) {
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
    exports.default = ForStructure;
    ForStructure.meta = {
        selector: '[*for]',
    };
});
define("href/href.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_10, directive_3, module_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_3 = tslib_10.__importDefault(directive_3);
    class HrefDirective extends directive_3.default {
        onChanges(changes) {
            const { node } = module_4.getContext(this);
            node.setAttribute('href', this.href);
        }
    }
    exports.default = HrefDirective;
    HrefDirective.meta = {
        selector: '[[href]]',
        inputs: ['href'],
    };
});
define("if/if.structure", ["require", "exports", "tslib", "core/structure", "module/module"], function (require, exports, tslib_11, structure_3, module_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    structure_3 = tslib_11.__importDefault(structure_3);
    class IfStructure extends structure_3.default {
        constructor() {
            super(...arguments);
            this.instances = [];
        }
        onInit() {
            const { module, node } = module_5.getContext(this);
            const ifbegin = this.ifbegin = document.createComment(`*if begin`);
            ifbegin['rxcompId'] = node.rxcompId;
            node.parentNode.replaceChild(ifbegin, node);
            const ifend = this.ifend = document.createComment(`*if end`);
            ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
            const expression = node.getAttribute('*if');
            this.ifFunction = module.makeFunction(expression);
            const clonedNode = node.cloneNode(true);
            clonedNode.removeAttribute('*if');
            this.clonedNode = clonedNode;
            this.node = clonedNode.cloneNode(true);
        }
        onChanges(changes) {
            const { module } = module_5.getContext(this);
            const value = module.resolve(this.ifFunction, changes, this);
            const node = this.node;
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
        }
    }
    exports.default = IfStructure;
    IfStructure.meta = {
        selector: '[*if]',
    };
});
define("inner-html/inner-html.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_12, directive_4, module_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_4 = tslib_12.__importDefault(directive_4);
    class InnerHtmlDirective extends directive_4.default {
        onChanges(changes) {
            const { node } = module_6.getContext(this);
            node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML;
        }
    }
    exports.default = InnerHtmlDirective;
    InnerHtmlDirective.meta = {
        selector: `[innerHTML]`,
        inputs: ['innerHTML'],
    };
});
define("json/json.pipe", ["require", "exports", "tslib", "core/pipe"], function (require, exports, tslib_13, pipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    pipe_1 = tslib_13.__importDefault(pipe_1);
    class JsonPipe extends pipe_1.default {
        static transform(value) {
            return JSON.stringify(value, null, '\t');
        }
    }
    exports.default = JsonPipe;
    JsonPipe.meta = {
        name: 'json',
    };
});
define("src/src.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_14, directive_5, module_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_5 = tslib_14.__importDefault(directive_5);
    class SrcDirective extends directive_5.default {
        onChanges(changes) {
            const { node } = module_7.getContext(this);
            node.setAttribute('src', this.src);
        }
    }
    exports.default = SrcDirective;
    SrcDirective.meta = {
        selector: '[[src]]',
        inputs: ['src'],
    };
});
define("style/style.directive", ["require", "exports", "tslib", "core/directive", "module/module"], function (require, exports, tslib_15, directive_6, module_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    directive_6 = tslib_15.__importDefault(directive_6);
    class StyleDirective extends directive_6.default {
        onInit() {
            const { module, node } = module_8.getContext(this);
            const expression = node.getAttribute('[style]');
            this.styleFunction = module.makeFunction(expression);
        }
        onChanges(changes) {
            const { module, node } = module_8.getContext(this);
            const style = module.resolve(this.styleFunction, changes, this);
            for (let key in style) {
                node.style.setProperty(key, style[key]);
            }
        }
    }
    exports.default = StyleDirective;
    StyleDirective.meta = {
        selector: `[[style]]`
    };
});
define("core.module", ["require", "exports", "tslib", "class/class.directive", "event/event.directive", "for/for.structure", "href/href.directive", "if/if.structure", "inner-html/inner-html.directive", "json/json.pipe", "module/module", "src/src.directive", "style/style.directive"], function (require, exports, tslib_16, class_directive_1, event_directive_1, for_structure_1, href_directive_1, if_structure_1, inner_html_directive_1, json_pipe_1, module_9, src_directive_1, style_directive_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class_directive_1 = tslib_16.__importDefault(class_directive_1);
    event_directive_1 = tslib_16.__importDefault(event_directive_1);
    for_structure_1 = tslib_16.__importDefault(for_structure_1);
    href_directive_1 = tslib_16.__importDefault(href_directive_1);
    if_structure_1 = tslib_16.__importDefault(if_structure_1);
    inner_html_directive_1 = tslib_16.__importDefault(inner_html_directive_1);
    json_pipe_1 = tslib_16.__importDefault(json_pipe_1);
    module_9 = tslib_16.__importDefault(module_9);
    src_directive_1 = tslib_16.__importDefault(src_directive_1);
    style_directive_1 = tslib_16.__importDefault(style_directive_1);
    class CoreModule extends module_9.default {
    }
    exports.default = CoreModule;
    const factories = [
        class_directive_1.default,
        event_directive_1.default,
        for_structure_1.default,
        href_directive_1.default,
        if_structure_1.default,
        inner_html_directive_1.default,
        src_directive_1.default,
        style_directive_1.default,
    ];
    const pipes = [
        json_pipe_1.default,
    ];
    CoreModule.meta = {
        declarations: [
            ...factories,
            ...pipes,
        ],
        exports: [
            ...factories,
            ...pipes,
        ]
    };
});
define("platform/platform", ["require", "exports", "tslib", "core/component", "core/directive", "core/pipe", "core/structure"], function (require, exports, tslib_17, component_3, directive_7, pipe_2, structure_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    component_3 = tslib_17.__importDefault(component_3);
    directive_7 = tslib_17.__importDefault(directive_7);
    pipe_2 = tslib_17.__importDefault(pipe_2);
    structure_4 = tslib_17.__importDefault(structure_4);
    const ORDER = [structure_4.default, component_3.default, directive_7.default];
    class Platform {
        static bootstrap(moduleFactory) {
            const meta = this.resolveMeta(moduleFactory);
            const bootstrap = meta.bootstrap;
            if (!bootstrap) {
                throw ('missing bootstrap');
            }
            const node = meta.node = this.querySelector(bootstrap.meta.selector);
            if (!node) {
                throw (`missing node ${bootstrap.meta.selector}`);
            }
            meta.nodeInnerHTML = node.innerHTML;
            const pipes = meta.pipes = this.resolvePipes(meta);
            const factories = meta.factories = this.resolveFactories(meta);
            this.sortFactories(factories);
            factories.unshift(bootstrap);
            const selectors = meta.selectors = this.unwrapSelectors(factories);
            const module = new moduleFactory();
            module.meta = meta;
            const instances = module.compile(node, window);
            const root = instances[0];
            root.pushChanges();
            return module;
        }
        static querySelector(selector) {
            return document.querySelector(selector);
        }
        static resolveMeta(moduleFactory) {
            const meta = Object.assign({ imports: [], declarations: [], pipes: [], exports: [] }, moduleFactory.meta);
            meta.imports = meta.imports.map(moduleFactory => this.resolveMeta(moduleFactory));
            return meta;
        }
        static resolvePipes(meta, exported) {
            const importedPipes = meta.imports.map((importMeta) => this.resolvePipes(importMeta, true));
            const pipes = {};
            const pipeList = (exported ? meta.exports : meta.declarations).filter((x) => x.prototype instanceof pipe_2.default);
            pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
            return Object.assign({}, ...importedPipes, pipes);
        }
        static resolveFactories(meta, exported) {
            const importedFactories = meta.imports.map((importMeta) => this.resolveFactories(importMeta, true));
            const factoryList = (exported ? meta.exports : meta.declarations).filter(x => (x.prototype instanceof structure_4.default || x.prototype instanceof component_3.default || x.prototype instanceof directive_7.default));
            return Array.prototype.concat.call(factoryList, ...importedFactories);
        }
        static sortFactories(factories) {
            factories.sort((a, b) => {
                const ai = ORDER.reduce((p, c, i) => a.prototype instanceof c ? i : p, -1);
                const bi = ORDER.reduce((p, c, i) => b.prototype instanceof c ? i : p, -1);
                const o = ai - bi;
                if (o === 0) {
                    return (a.meta.hosts ? 1 : 0) - (b.meta.hosts ? 1 : 0);
                }
                return o;
            });
        }
        static getExpressions(selector) {
            let matchers = [];
            selector.replace(/\.([\w\-\_]+)|\[(.+?\]*)(\=)(.*?)\]|\[(.+?\]*)\]|([\w\-\_]+)/g, function (value, c1, a2, u3, v4, a5, e6) {
                if (c1) {
                    matchers.push(function (node) {
                        return node.classList.contains(c1);
                    });
                }
                if (a2) {
                    matchers.push(function (node) {
                        return (node.hasAttribute(a2) && node.getAttribute(a2) === v4) ||
                            (node.hasAttribute(`[${a2}]`) && node.getAttribute(`[${a2}]`) === v4);
                    });
                }
                if (a5) {
                    matchers.push(function (node) {
                        return node.hasAttribute(a5) || node.hasAttribute(`[${a5}]`);
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
        }
        static unwrapSelectors(factories) {
            const selectors = [];
            factories.forEach(factory => {
                factory.meta.selector.split(',').forEach(selector => {
                    selector = selector.trim();
                    let excludes = [];
                    const matchSelector = selector.replace(/\:not\((.+?)\)/g, (value, unmatchSelector) => {
                        excludes = this.getExpressions(unmatchSelector);
                        return '';
                    });
                    const includes = this.getExpressions(matchSelector);
                    selectors.push((node) => {
                        const include = includes.reduce((result, e) => {
                            return result && e(node);
                        }, true);
                        const exclude = excludes.reduce((result, e) => {
                            return result || e(node);
                        }, false);
                        if (include && !exclude) {
                            return { node, factory, selector };
                        }
                        else {
                            return false;
                        }
                    });
                });
            });
            return selectors;
        }
        static isBrowser() {
            return Boolean(window);
        }
    }
    exports.default = Platform;
});
define("platform/browser", ["require", "exports", "tslib", "platform/platform"], function (require, exports, tslib_18, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1 = tslib_18.__importDefault(platform_1);
    class Browser extends platform_1.default {
    }
    exports.default = Browser;
});
define("rxcomp", ["require", "exports", "class/class.directive", "core.module", "core/component", "core/context", "core/directive", "core/pipe", "core/structure", "event/event.directive", "for/for.item", "for/for.structure", "href/href.directive", "if/if.structure", "inner-html/inner-html.directive", "json/json.pipe", "module/module", "platform/browser", "platform/platform", "src/src.directive", "style/style.directive"], function (require, exports, class_directive_2, core_module_1, component_4, context_3, directive_8, pipe_3, structure_5, event_directive_2, for_item_2, for_structure_2, href_directive_2, if_structure_2, inner_html_directive_2, json_pipe_2, module_10, browser_1, platform_2, src_directive_2, style_directive_2) {
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
    exports.Module = module_10.default;
    exports.getContext = module_10.getContext;
    exports.getContextByNode = module_10.getContextByNode;
    exports.getHost = module_10.getHost;
    exports.Browser = browser_1.default;
    exports.Platform = platform_2.default;
    exports.SrcDirective = src_directive_2.default;
    exports.StyleDirective = style_directive_2.default;
});
//# sourceMappingURL=../../src/rxcomp.js.map