import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Component from '../core/component';
import Context from '../core/context';
import Factory, { CONTEXT_MAP, EXPRESSION_MAP, getContext, NODE_MAP } from '../core/factory';
import Structure from '../core/structure';
import { ExpressionError, nextError$ } from '../error/error';
export default class Module {
    constructor() {
        this.unsubscribe$ = new Subject();
    }
    compile(node, parentInstance, instances = []) {
        if (node.nodeType === 1) {
            const selectors = this.meta.selectors;
            const matches = [];
            // const childNodes: NodeListOf<ChildNode> = node.childNodes;
            // copying array to avoid multiple compilation
            const childNodes = Array.prototype.slice.call(node.childNodes);
            // const foundStructure : boolean = Module.matchSelectors(node as HTMLElement, selectors, matches);
            let foundStructure = false;
            for (let i = 0, len = selectors.length; i < len; i++) {
                const selectorResult = selectors[i](node);
                if (selectorResult) { // !== false
                    // match found
                    matches.push(selectorResult);
                    const factory = selectorResult.factory;
                    // structure found
                    if (factory.prototype instanceof Structure) {
                        foundStructure = true;
                        break;
                    }
                    // injecting template
                    if (factory.prototype instanceof Component && factory.meta.template) {
                        node.innerHTML = factory.meta.template;
                    }
                }
            }
            let nextParentInstance = parentInstance;
            for (let i = 0, len = matches.length; i < len; i++) {
                const match = matches[i];
                // console.log('makeInstance', parentInstance.constructor.name, match.factory.name);
                // make instance
                const instance = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
                if (instance) {
                    instances.push(instance);
                    // updating parentInstance
                    if (match.factory.prototype instanceof Component) {
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
                for (let i = 0, len = childNodes.length; i < len; i++) {
                    this.compile(childNodes[i], nextParentInstance, instances);
                }
            }
        }
        return instances;
    }
    makeInstance(node, factory, selector, parentInstance, args, inject) {
        const meta = factory.meta;
        // creating factory instance
        const instance = new factory(...(args || []));
        // console.log(instance.constructor.name, parentInstance.constructor.name);
        // injecting custom properties
        if (inject != null) {
            for (let i = 0, keys = Object.keys(inject), len = keys.length; i < len; i++) {
                const key = keys[i];
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
        const context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
        // creating component input and outputs
        if (instance instanceof Context) {
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
        if (parentInstance instanceof Factory) {
            const { childInstances } = getContext(parentInstance);
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
    }
    makeFunction(expression, params = ['$instance']) {
        const name = expression + '_' + params.join(',');
        const cachedExpressionFunction = EXPRESSION_MAP.get(name);
        if (cachedExpressionFunction) {
            return cachedExpressionFunction;
        }
        else {
            this.meta.context = Context; // !!!
            expression = Module.parseExpression(expression);
            const text = `
			return (function (${params.join(',')}, $$module) {
				var $$pipes = $$module.meta.pipes;
				try {
					if (this.parentInstance) {
						with(this.parentInstance) {
							with(this) {
								return ${expression};
							}
						}
					} else {
						with(this) {
							return ${expression};
						}
					}
				} catch(error) {
					$$module.nextError(error, this, ${JSON.stringify(expression)}, arguments);
				}
			}.bind(this)).apply(this, arguments);`;
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
            const expressionFunction = new Function(text);
            expressionFunction.expression = expression;
            EXPRESSION_MAP.set(name, expressionFunction);
            return expressionFunction;
        }
    }
    resolveInputsOutputs(instance, changes) {
        const context = getContext(instance);
        const parentInstance = context.parentInstance;
        const inputs = context.inputs;
        for (let i = 0, keys = Object.keys(inputs), len = keys.length; i < len; i++) {
            const key = keys[i];
            const expression = inputs[key];
            const value = this.resolve(expression, parentInstance, instance);
            instance[key] = value;
        }
        /*
        Object.keys(inputs).forEach(key => {
            const expression: ExpressionFunction = inputs[key];
            const value: any = this.resolve(expression, parentInstance, instance);
            instance[key] = value;
        });
        */
    }
    getInputAttributeExpression(key, node) {
        let expression = null;
        if (node.hasAttribute(`[${key}]`)) {
            expression = node.getAttribute(`[${key}]`);
            // console.log('Module.getInputAttributeExpression.expression.1', expression);
        }
        else if (node.hasAttribute(`*${key}`)) {
            expression = node.getAttribute(`*${key}`);
            // console.log('Module.getInputAttributeExpression.expression.2', expression);
        }
        else if (node.hasAttribute(key)) {
            expression = node.getAttribute(key);
            if (expression) {
                const attribute = expression.replace(/({{)|(}})|(")/g, function (substring, a, b, c) {
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
                // console.log('Module.getInputAttributeExpression.expression.3', expression);
            }
        }
        // console.log('Module.getInputAttributeExpression.expression', expression);
        return expression;
    }
    resolve(expression, parentInstance, payload) {
        // console.log('Module.resolve', expression, parentInstance, payload, getContext);
        return expression.apply(parentInstance, [payload, this]);
    }
    parse(node, instance) {
        for (let i = 0, len = node.childNodes.length; i < len; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === 1) {
                const element = child;
                const context = getParsableContextByElement(element);
                if (!context) {
                    this.parse(element, instance);
                }
            }
            else if (child.nodeType === 3) {
                const text = child;
                this.parseTextNode(text, instance);
            }
        }
    }
    remove(node, keepInstance) {
        const keepContext = keepInstance ? getContext(keepInstance) : undefined;
        Module.traverseDown(node, (node) => {
            Module.deleteContext(node, keepContext);
        });
        return node;
    }
    destroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.remove(this.meta.node);
        this.meta.node.innerHTML = this.meta.nodeInnerHTML;
    }
    nextError(error, instance, expression, params) {
        const expressionError = new ExpressionError(error, this, instance, expression, params);
        nextError$.next(expressionError);
    }
    makeContext(instance, parentInstance, node, selector) {
        const context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
        // console.log('Module.makeContext', context, context.instance, context.node);
        return context;
    }
    makeHosts(meta, instance, node) {
        if (meta.hosts) {
            for (let i = 0, keys = Object.keys(meta.hosts), len = keys.length; i < len; i++) {
                const key = keys[i];
                const factory = meta.hosts[key];
                instance[key] = getHost(instance, factory, node);
            }
            /*
            Object.keys(meta.hosts).forEach((key: string) => {
                const factory: typeof Factory = meta.hosts![key];
                instance[key] = getHost(instance, factory, node);
            });
            */
        }
    }
    makeInputs(meta, node, factory) {
        const inputs = {};
        if (meta.inputs) {
            for (let i = 0, len = meta.inputs.length; i < len; i++) {
                const key = meta.inputs[i];
                let expression = this.getInputAttributeExpression(key, node);
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
    }
    makeOutput(instance, key) {
        const context = getContext(instance);
        const node = context.node;
        const parentInstance = context.parentInstance;
        const expression = node.getAttribute(`(${key})`);
        const outputExpression = expression ? this.makeFunction(expression, ['$event']) : null;
        const output$ = new Subject().pipe(tap((event) => {
            if (outputExpression) {
                // console.log(expression, parentInstance);
                this.resolve(outputExpression, parentInstance, event);
            }
        }));
        output$.pipe(takeUntil(instance.unsubscribe$)).subscribe();
        instance[key] = output$;
        return output$;
    }
    makeOutputs(meta, instance) {
        const outputs = {};
        if (meta.outputs) {
            meta.outputs.forEach((key) => {
                const output = this.makeOutput(instance, key);
                if (output) {
                    outputs[key] = output;
                }
            });
        }
        return outputs;
    }
    parseTextNode(node, instance) {
        let expressions = node.nodeExpressions;
        if (!expressions) {
            expressions = this.parseTextNodeExpression(node.wholeText);
        }
        if (expressions.length) {
            const replacedText = expressions.reduce((p, c) => {
                let text;
                if (typeof c === 'function') { // instanceOf ExpressionFunction ?;
                    // console.log('Module.parseTextNode', c, instance);
                    text = this.resolve(c, instance, instance);
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
                const textNode = document.createTextNode(replacedText);
                textNode.nodeExpressions = expressions;
                node.parentNode.replaceChild(textNode, node);
            }
        }
        else {
            node.nodeExpressions = expressions;
        }
    }
    pushFragment(nodeValue, from, to, expressions) {
        const fragment = nodeValue.substring(from, to);
        expressions.push(fragment);
    }
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
            if (matches[1]) {
                const expression = this.makeFunction(matches[1]);
                expressions.push(expression);
            }
        }
        // console.log('Module.parseTextNodeExpression', regex.source, expressions, nodeValue);
        const length = nodeValue.length;
        if (length > lastIndex) {
            this.pushFragment(nodeValue, lastIndex, length, expressions);
        }
        if (expressions.find(x => typeof x === 'function')) {
            return expressions;
        }
        else {
            return [];
        }
    }
    static makeContext(module, instance, parentInstance, node, factory, selector) {
        const context = { module, instance, parentInstance, childInstances: [], node, factory, selector };
        let nodeContexts = NODE_MAP.get(node);
        if (!nodeContexts) {
            nodeContexts = [];
            NODE_MAP.set(node, nodeContexts);
        }
        nodeContexts.push(context);
        CONTEXT_MAP.set(instance, context);
        return context;
    }
    static parseExpression(expression) {
        expression = Module.parseGroup(expression);
        expression = Module.parseOptionalChaining(expression);
        // expression = Module.parseThis(expression);
        return expression;
    }
    static parseGroup(expression) {
        const l = '┌';
        const r = '┘';
        const rx1 = /(\()([^\(\)]*)(\))/;
        while (rx1.test(expression)) {
            expression = expression.replace(rx1, function (m, ...args) {
                return `${l}${Module.parsePipes(args[1])}${r}`;
            });
        }
        expression = Module.parsePipes(expression);
        const rx2 = /(┌)|(┘)/g;
        expression = expression.replace(rx2, function (m, ...args) {
            return args[0] ? '(' : ')';
        });
        return expression;
    }
    static parsePipes(expression) {
        const rx = /(.*?[^\|])\|\s*(\w+)\s*([^\|]+)/;
        while (rx.test(expression)) {
            expression = expression.replace(rx, function (m, value, name, expression) {
                const params = Module.parsePipeParams(expression);
                return `$$pipes.${name}.transform(${[value, ...params]})`;
            });
        }
        return expression;
    }
    static parsePipeParams(expression) {
        const params = [];
        // const rx = /:\s*(\[.+\]|\{.+\}|\(.+\)|\'.+\'|[^:\s]+)/g;
        const rx = /:\s*(\{.+\}|\(.+\)|[^:]+)/g;
        let match;
        while (match = rx.exec(expression)) {
            params.push(match[1]);
        }
        return params;
    }
    static parseOptionalChaining(expression) {
        const rx = /([\w|\.]+)(?:\?\.)+([\.|\w]+)/;
        while (rx.test(expression)) {
            expression = expression.replace(rx, function (m, a, b) {
                return `${a} && ${a}.${b}`;
            });
        }
        return expression;
    }
    static parseThis(expression) {
        const rx = /(\'.+\'|\[.+\]|\{.+\}|\$\$pipes)|([^\w.])([^\W\d])|^([^\W\d])/g;
        expression = expression.replace(rx, function (m, g1, g2, g3, g4) {
            if (g4) {
                return `this.${g4}`;
            }
            else if (g3) {
                return `${g2}this.${g3}`;
            }
            else {
                return g1;
            }
        });
        return expression;
    }
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
    static removeFromParentInstance(instance, parentInstance) {
        // console.log('Module.removeFromParentInstance', instance);
        if (parentInstance instanceof Factory) {
            const parentContext = getContext(parentInstance);
            if (parentContext) {
                const i = parentContext.childInstances.indexOf(instance);
                if (i !== -1) {
                    parentContext.childInstances.splice(i, 1);
                } /* else {
                    console.log('not found', instance, 'in', parentInstance);
                }*/
            }
        }
    }
    static deleteContext(node, keepContext) {
        const keepContexts = [];
        const nodeContexts = NODE_MAP.get(node);
        if (nodeContexts) {
            nodeContexts.forEach((context) => {
                if (context === keepContext) {
                    keepContexts.push(keepContext);
                }
                else {
                    const instance = context.instance;
                    // !!!
                    Module.removeFromParentInstance(instance, context.parentInstance);
                    // !!!
                    instance.unsubscribe$.next();
                    instance.unsubscribe$.complete();
                    instance.onDestroy();
                    CONTEXT_MAP.delete(instance);
                }
            });
            if (keepContexts.length) {
                NODE_MAP.set(node, keepContexts);
            }
            else {
                NODE_MAP.delete(node);
            }
        }
        return keepContexts;
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
export function getParsableContextByElement(element) {
    let context;
    const contexts = NODE_MAP.get(element);
    if (contexts) {
        context = contexts.reduce((previous, current) => {
            if (current.instance instanceof Context) {
                return previous ? previous : current;
            }
            else if (current.instance instanceof Component) {
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
export function getContextByNode(element) {
    let context = getParsableContextByElement(element);
    if (context && context.factory.prototype instanceof Structure) {
        return undefined;
    }
    return context;
}
export function getHost(instance, factory, node) {
    if (!node) {
        node = getContext(instance).node;
    }
    const nodeContexts = NODE_MAP.get(node);
    if (nodeContexts) {
        // console.log(nodeContexts);
        for (let i = 0, len = nodeContexts.length; i < len; i++) {
            const context = nodeContexts[i];
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
