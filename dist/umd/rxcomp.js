/**
 * @license rxcomp v1.0.0-beta.5
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('rxjs/operators')) :
	typeof define === 'function' && define.amd ? define(['exports', 'rxjs', 'rxjs/operators'], factory) :
	(global = global || self, factory(global.rxcomp = {}, global.rxjs, global.rxjs.operators));
}(this, (function (exports, rxjs, operators) { 'use strict';

	class Factory {
	    constructor(...args) {
	    }
	}

	class Directive extends Factory {
	}

	class Component extends Factory {
	}

	const RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
	class Context extends Component {
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

	class Structure extends Factory {
	}

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
	            if (match.factory.prototype instanceof Component) {
	                componentNode = match.node;
	            }
	            return instance;
	        }).filter(x => x);
	        return instances;
	    }
	    makeInstance(node, factory, selector, parentInstance, args) {
	        if (parentInstance || node.parentNode) {
	            const isComponent = factory.prototype instanceof Component;
	            const meta = factory.meta;
	            parentInstance = parentInstance || this.getParentInstance(node.parentNode);
	            if (!parentInstance) {
	                return;
	            }
	            const instance = new factory(...(args || []));
	            const context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
	            Object.defineProperties(instance, {
	                changes$: {
	                    value: new rxjs.BehaviorSubject(instance),
	                    writable: false,
	                    enumerable: false,
	                },
	                unsubscribe$: {
	                    value: new rxjs.Subject(),
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
	            if (parentInstance instanceof Factory && parentInstance.changes$) {
	                parentInstance.changes$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe(changes => {
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
	        const output$ = new rxjs.Subject().pipe(operators.tap((event) => {
	            this.resolve(outputFunction, parentInstance, event);
	        }));
	        output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
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
	    }
	    static querySelectorsAll(node, selectors, results) {
	        if (node.nodeType === 1) {
	            const matches = this.matchSelectors(node, selectors, []);
	            results = results.concat(matches);
	            const structure = matches.find(x => x.factory.prototype instanceof Structure);
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
	function getContext(instance) {
	    return CONTEXTS[instance.rxcompId];
	}
	function getContextByNode(node) {
	    let context;
	    const rxcompId = node['rxcompId'];
	    if (rxcompId) {
	        const nodeContexts = NODES[rxcompId];
	        if (nodeContexts) {
	            context = nodeContexts.reduce((previous, current) => {
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
	        const nodeContexts = NODES[node.rxcompId];
	        if (nodeContexts) {
	            for (let i = 0; i < nodeContexts.length; i++) {
	                const context = nodeContexts[i];
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

	class ClassDirective extends Directive {
	    onInit() {
	        const { module, node } = getContext(this);
	        const expression = node.getAttribute('[class]');
	        this.classFunction = module.makeFunction(expression);
	    }
	    onChanges(changes) {
	        const { module, node } = getContext(this);
	        const classList = module.resolve(this.classFunction, changes, this);
	        for (let key in classList) {
	            classList[key] ? node.classList.add(key) : node.classList.remove(key);
	        }
	    }
	}
	ClassDirective.meta = {
	    selector: `[[class]]`,
	};

	const EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];
	class EventDirective extends Directive {
	    onInit() {
	        const { module, node, parentInstance, selector } = getContext(this);
	        const event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
	        const event$ = this.event$ = rxjs.fromEvent(node, event).pipe(operators.shareReplay(1));
	        const expression = node.getAttribute(`(${event})`);
	        if (expression) {
	            const outputFunction = module.makeFunction(expression, ['$event']);
	            event$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(event => {
	                module.resolve(outputFunction, parentInstance, event);
	            });
	        }
	        else {
	            parentInstance[`${event}$`] = event$;
	        }
	    }
	}
	EventDirective.meta = {
	    selector: `[(${EVENTS.join(')],[(')})]`,
	};

	class ForItem extends Context {
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

	class ForStructure extends Structure {
	    constructor() {
	        super(...arguments);
	        this.instances = [];
	    }
	    onInit() {
	        const { module, node } = getContext(this);
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
	        const context = getContext(this);
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
	                    const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
	                    if (instance) {
	                        const forItemContext = getContext(instance);
	                        module.compile(clonedNode, forItemContext.instance);
	                        this.instances.push(instance);
	                    }
	                }
	            }
	            else {
	                const instance = this.instances[i];
	                const { node } = getContext(instance);
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
	ForStructure.meta = {
	    selector: '[*for]',
	};

	class HrefDirective extends Directive {
	    onChanges(changes) {
	        const { node } = getContext(this);
	        node.setAttribute('href', this.href);
	    }
	}
	HrefDirective.meta = {
	    selector: '[[href]]',
	    inputs: ['href'],
	};

	class IfStructure extends Structure {
	    constructor() {
	        super(...arguments);
	        this.instances = [];
	    }
	    onInit() {
	        const { module, node } = getContext(this);
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
	        const { module } = getContext(this);
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
	IfStructure.meta = {
	    selector: '[*if]',
	};

	class InnerHtmlDirective extends Directive {
	    onChanges(changes) {
	        const { node } = getContext(this);
	        node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML;
	    }
	}
	InnerHtmlDirective.meta = {
	    selector: `[innerHTML]`,
	    inputs: ['innerHTML'],
	};

	class Pipe {
	    static transform(value) {
	        return value;
	    }
	}

	class JsonPipe extends Pipe {
	    static transform(value) {
	        return JSON.stringify(value, null, '\t');
	    }
	}
	JsonPipe.meta = {
	    name: 'json',
	};

	class SrcDirective extends Directive {
	    onChanges(changes) {
	        const { node } = getContext(this);
	        node.setAttribute('src', this.src);
	    }
	}
	SrcDirective.meta = {
	    selector: '[[src]]',
	    inputs: ['src'],
	};

	class StyleDirective extends Directive {
	    onInit() {
	        const { module, node } = getContext(this);
	        const expression = node.getAttribute('[style]');
	        this.styleFunction = module.makeFunction(expression);
	    }
	    onChanges(changes) {
	        const { module, node } = getContext(this);
	        const style = module.resolve(this.styleFunction, changes, this);
	        for (let key in style) {
	            node.style.setProperty(key, style[key]);
	        }
	    }
	}
	StyleDirective.meta = {
	    selector: `[[style]]`
	};

	class CoreModule extends Module {
	}
	const factories = [
	    ClassDirective,
	    EventDirective,
	    ForStructure,
	    HrefDirective,
	    IfStructure,
	    InnerHtmlDirective,
	    SrcDirective,
	    StyleDirective,
	];
	const pipes = [
	    JsonPipe,
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

	const ORDER = [Structure, Component, Directive];
	class Platform {
	    static bootstrap(moduleFactory) {
	        const meta = this.resolveMeta(moduleFactory);
	        console.log(meta);
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
	        const pipeList = (exported ? meta.exports : meta.declarations).filter((x) => x.prototype instanceof Pipe);
	        pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
	        return Object.assign({}, ...importedPipes, pipes);
	    }
	    static resolveFactories(meta, exported) {
	        const importedFactories = meta.imports.map((importMeta) => this.resolveFactories(importMeta, true));
	        const factoryList = (exported ? meta.exports : meta.declarations).filter(x => (x.prototype instanceof Structure || x.prototype instanceof Component || x.prototype instanceof Directive));
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

	class Browser extends Platform {
	}

	exports.Browser = Browser;
	exports.ClassDirective = ClassDirective;
	exports.Component = Component;
	exports.Context = Context;
	exports.CoreModule = CoreModule;
	exports.Directive = Directive;
	exports.EventDirective = EventDirective;
	exports.ForItem = ForItem;
	exports.ForStructure = ForStructure;
	exports.HrefDirective = HrefDirective;
	exports.IfStructure = IfStructure;
	exports.InnerHtmlDirective = InnerHtmlDirective;
	exports.JsonPipe = JsonPipe;
	exports.Module = Module;
	exports.Pipe = Pipe;
	exports.Platform = Platform;
	exports.SrcDirective = SrcDirective;
	exports.Structure = Structure;
	exports.StyleDirective = StyleDirective;
	exports.getContext = getContext;
	exports.getContextByNode = getContextByNode;
	exports.getHost = getHost;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
