import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Component from '../core/component';
import Context from '../core/context';
import Factory, { CONTEXTS, getContext, NODES } from '../core/factory';
import Structure from '../core/structure';
import { ExpressionError, nextError$ } from '../error/error';
import { isPlatformBrowser } from '../platform/platform';
let ID = 0;
export default class Module {
    constructor() {
        this.unsubscribe$ = new Subject();
    }
    compile(node, parentInstance) {
        let componentNode;
        const instances = Module.querySelectorsAll(node, this.meta.selectors, []).map((match) => {
            if (componentNode && componentNode !== match.node) {
                parentInstance = undefined;
            }
            const instance = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
            if (match.factory.prototype instanceof Component) {
                componentNode = match.node;
            }
            return instance;
        }).filter((x) => x !== undefined);
        // instances.forEach(x => x.onInit());
        // console.log('compile', instances, node, parentInstance);
        return instances;
    }
    makeInstance(node, factory, selector, parentInstance, args, inject) {
        if (parentInstance || node.parentNode) {
            const meta = factory.meta;
            // collect parentInstance scope
            parentInstance = parentInstance || this.getParentInstance(node.parentNode);
            if (!parentInstance) {
                return undefined;
            }
            // creating factory instance
            const instance = new factory(...(args || []));
            // injecting custom properties
            if (inject) {
                Object.keys(inject).forEach(key => {
                    // console.log('Module.makeInstance', key, inject[key]);
                    Object.defineProperty(instance, key, {
                        value: inject[key],
                        configurable: false,
                        enumerable: false,
                        writable: true,
                    });
                });
            }
            // creating instance context
            const context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
            // creating component input and outputs
            if (meta) {
                this.makeHosts(meta, instance, node);
                context.inputs = this.makeInputs(meta, instance);
                context.outputs = this.makeOutputs(meta, instance);
                if (parentInstance instanceof Factory) {
                    this.resolveInputsOutputs(instance, parentInstance);
                }
            }
            // calling onInit event
            instance.onInit();
            // subscribe to parent changes
            if (parentInstance instanceof Factory) {
                parentInstance.changes$.pipe(
                // filter(() => node.parentNode),
                // debounceTime(1),
                /*
                distinctUntilChanged(function(prev, curr) {
                    // console.log(isComponent, context.inputs);
                    if (isComponent && meta && Object.keys(context.inputs).length === 0) {
                        return true; // same
                    } else {
                        return false;
                    }
                }),
                */
                takeUntil(instance.unsubscribe$)).subscribe((changes) => {
                    // resolve component input outputs
                    if (meta) {
                        this.resolveInputsOutputs(instance, changes);
                    }
                    // calling onChanges event with changes
                    instance.onChanges(changes);
                    // push instance changes for subscribers
                    instance.pushChanges();
                });
            }
            return instance;
        }
        else {
            return undefined;
        }
    }
    makeFunction(expression, params = ['$instance']) {
        if (expression) {
            expression = Module.parseExpression(expression);
            // console.log(expression);
            const args = params.join(',');
            const expression_func = new Function(`with(this) {
				return (function (${args}, $$module) {
					try {
						const $$pipes = $$module.meta.pipes;
						return ${expression};
					} catch(error) {
						$$module.nextError(error, this, ${JSON.stringify(expression)}, arguments);
					}
				}.bind(this)).apply(this, arguments);
			}`);
            // console.log(this, $$module, $$pipes, "${expression}");
            // console.log(expression_func);
            return expression_func;
        }
        else {
            return () => { return null; };
        }
    }
    nextError(error, instance, expression, params) {
        const expressionError = new ExpressionError(error, this, instance, expression, params);
        nextError$.next(expressionError);
    }
    resolve(expression, parentInstance, payload) {
        // console.log(expression, parentInstance, payload);
        return expression.apply(parentInstance, [payload, this]);
    }
    parse(node, instance) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === 1) {
                const element = child;
                const context = getParsableContextByNode(element);
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
    destroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.remove(this.meta.node);
        this.meta.node.innerHTML = this.meta.nodeInnerHTML;
    }
    makeContext(instance, parentInstance, node, selector) {
        const context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
        // console.log('Module.makeContext', context, context.instance, context.node);
        return context;
    }
    getInstance(node) {
        if (node === document) {
            return (isPlatformBrowser ? window : global);
        }
        const context = getContextByNode(node);
        if (context) {
            return context.instance;
        }
        else {
            return undefined;
        }
    }
    getParentInstance(node) {
        return Module.traverseUp(node, (node) => {
            return this.getInstance(node);
        });
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
            const expression = this.makeFunction(matches[1]);
            expressions.push(expression);
        }
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
        let input = null, expression = null;
        if (node.hasAttribute(`[${key}]`)) {
            expression = node.getAttribute(`[${key}]`);
        }
        else if (node.hasAttribute(key)) {
            // const attribute = node.getAttribute(key).replace(/{{/g, '"+').replace(/}}/g, '+"');
            const attribute = node.getAttribute(key).replace(/({{)|(}})|(")/g, function (substring, a, b, c) {
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
        }
        if (expression) {
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
        const outputFunction = expression ? this.makeFunction(expression, ['$event']) : null;
        const output$ = new Subject().pipe(tap((event) => {
            if (outputFunction) {
                // console.log(expression, parentInstance);
                this.resolve(outputFunction, parentInstance, event);
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
    static parseExpression(expression) {
        const l = '┌';
        const r = '┘';
        const rx1 = /(\()([^\(\)]*)(\))/;
        while (expression.match(rx1)) {
            expression = expression.replace(rx1, function (substring, ...args) {
                return `${l}${Module.parsePipes(args[1])}${r}`;
            });
        }
        expression = Module.parsePipes(expression);
        expression = expression.replace(/(┌)|(┘)/g, function (substring, ...args) {
            return args[0] ? '(' : ')';
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
                return `$$pipes.${func}.transform${l}${[value, ...params]}${r}`;
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
            nodeContexts.forEach((context) => {
                if (context === keepContext) {
                    keepContexts.push(keepContext);
                }
                else {
                    const instance = context.instance;
                    instance.unsubscribe$.next();
                    instance.unsubscribe$.complete();
                    instance.onDestroy();
                    delete CONTEXTS[instance.rxcompId];
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
            const selectorResult = selectors[i](node);
            if (selectorResult) {
                const factory = selectorResult.factory;
                if (factory.prototype instanceof Component && factory.meta.template) {
                    node.innerHTML = factory.meta.template;
                }
                results.push(selectorResult);
                if (factory.prototype instanceof Structure) {
                    // console.log('Structure', node);
                    break;
                }
            }
        }
        return results;
    }
    static querySelectorsAll(node, selectors, results) {
        if (node.nodeType === 1) {
            const selectorResults = this.matchSelectors(node, selectors, []);
            results = results.concat(selectorResults);
            const structure = selectorResults.find(x => x.factory.prototype instanceof Structure);
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
export function getParsableContextByNode(node) {
    let context;
    const rxcompId = node.rxcompId;
    if (rxcompId) {
        const nodeContexts = NODES[rxcompId];
        if (nodeContexts) {
            context = nodeContexts.reduce((previous, current) => {
                if (current.factory.prototype instanceof Component) {
                    return current;
                }
                else if (current.factory.prototype instanceof Context) {
                    return previous ? previous : current;
                    /*
                    } else if (current.factory.prototype instanceof Structure) {
                        return previous ? previous : current;
                    */
                }
                else {
                    return previous;
                }
            }, undefined);
            // console.log(node.rxcompId, context);
        }
    }
    return context;
}
export function getContextByNode(node) {
    let context = getParsableContextByNode(node);
    if (context && context.factory.prototype instanceof Structure) {
        context = undefined;
    }
    return context;
}
export function getHost(instance, factory, node) {
    if (!node) {
        node = getContext(instance).node;
    }
    if (node.rxcompId) {
        const nodeContexts = NODES[node.rxcompId];
        if (nodeContexts) {
            // console.log(nodeContexts);
            for (let i = 0; i < nodeContexts.length; i++) {
                const context = nodeContexts[i];
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
