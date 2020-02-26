import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Component from '../core/component';
import Context from '../core/context';
import Factory from '../core/factory';
import Structure from '../core/structure';
import { ExpressionFunction, IContext, IElement, IFactoryMeta, IModuleMeta, ISelectorResult, IText, SelectorFunction } from '../core/types';

let ID: number = 0;
const CONTEXTS: { [key: number]: IContext } = {};
const NODES: { [key: number]: IContext[] } = {};

export default class Module {

	meta: IModuleMeta;

	compile(node: IElement, parentInstance?: Factory | Window): Factory[] {
		let componentNode: IElement;
		const instances: Factory[] = Module.querySelectorsAll(node, this.meta.selectors, []).map((match: ISelectorResult) => {
			if (componentNode && componentNode !== match.node) {
				parentInstance = undefined;
			}
			const instance: Factory | undefined = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
			if (match.factory.prototype instanceof Component) {
				componentNode = match.node;
			}
			return instance;
		}).filter(x => x != undefined);
		// console.log('compile', instances, node, parentInstance);
		return instances;
	}

	makeInstance(node: IElement, factory: typeof Factory, selector: string, parentInstance: Factory | Window, args?: any[]): Factory | undefined {
		if (parentInstance || node.parentNode) {
			const isComponent = factory.prototype instanceof Component;
			const meta = factory.meta;
			// console.log('meta', meta, factory);
			// collect parentInstance scope
			parentInstance = parentInstance || this.getParentInstance(node.parentNode);
			if (!parentInstance) {
				return;
			}
			// creating factory instance
			const instance = new factory(...(args || []));
			// creating instance context
			const context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
			// injecting changes$ and unsubscribe$ subjects
			Object.defineProperties(instance, {
				changes$: {
					value: new BehaviorSubject(instance),
					writable: false,
					enumerable: false,
				},
				unsubscribe$: {
					value: new Subject(),
					writable: false,
					enumerable: false,
				}
			});
			let initialized;
			// injecting instance pushChanges method
			const module = this;
			instance.pushChanges = function () {
				// console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
				this.changes$.next(this);
				// parse component text nodes
				if (isComponent) {
					// console.log('Module.parse', instance.constructor.name);
					initialized ? module.parse(node, instance) : setTimeout(function () { module.parse(node, instance); });
				}
				// calling onView event
				if (typeof instance['onView'] === 'function') {
					// console.log('onView', instance.constructor.name);
					instance['onView']();
				}
			};
			// creating component input and outputs
			// if (isComponent && meta) {
			if (meta) {
				this.makeHosts(meta, instance, node);
				context.inputs = this.makeInputs(meta, instance);
				context.outputs = this.makeOutputs(meta, instance);
			}
			// calling onInit event
			if (typeof instance['onInit'] === 'function') {
				instance['onInit']();
			}
			initialized = true;
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
					takeUntil(instance.unsubscribe$)
				).subscribe((changes: Factory | Window) => {
					// resolve component input outputs
					// if (isComponent && meta) {
					if (meta) {
						this.resolveInputsOutputs(instance, changes);
					}
					// calling onChanges event with changes
					if (typeof instance['onChanges'] === 'function') {
						// console.log('onChanges', instance.constructor.name);
						// console.log('onChanges', instance.constructor.meta.selector, changes);
						instance['onChanges'](changes);
					}
					// push instance changes for subscribers
					instance.pushChanges();
				});
			}
			return instance;
		}
	}

	makeContext(instance: Factory, parentInstance: Factory | Window, node: IElement, selector: string): IContext {
		const context: IContext = Module.makeContext(this, instance, parentInstance, node, instance.constructor as typeof Factory, selector);
		// console.log('Module.makeContext', context, context.instance, context.node);
		return context;
	}

	makeFunction(expression: string, params: string[] = ['$instance']): ExpressionFunction {
		if (expression) {
			expression = Module.parseExpression(expression);
			// console.log(expression);
			const args: string = params.join(',');
			const expression_func: ExpressionFunction = new Function(`with(this) {
				return (function (${args}, $$module) {
					const $$pipes = $$module.meta.pipes;
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`) as ExpressionFunction;
			// console.log(expression_func);
			return expression_func;
		} else {
			return () => { return null; };
		}
	}

	getInstance(node: HTMLElement | Document): Factory | Window {
		if (node instanceof Document) {
			return window; // !!! window or global
		}
		const context: IContext | void = getContextByNode(node);
		if (context) {
			return context.instance;
		}
	}

	getParentInstance(node: Node): Factory | Window {
		return Module.traverseUp(node, (node: Node) => {
			return this.getInstance(node as HTMLElement);
		});
	}

	parse(node: IElement, instance: Factory): void {
		for (let i: number = 0; i < node.childNodes.length; i++) {
			const child: ChildNode = node.childNodes[i];
			if (child.nodeType === 1) {
				const element: HTMLElement = child as HTMLElement;
				const context: IContext | void = getContextByNode(element);
				if (!context) {
					this.parse(element, instance);
				}
			} else if (child.nodeType === 3) {
				const text: IText = child as IText;
				this.parseTextNode(text, instance);
			}
		}
	}

	// reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;

	parseTextNode(node: IText, instance: Factory): void {
		let expressions: (ExpressionFunction | string)[] = node.nodeExpressions;
		if (!expressions) {
			expressions = this.parseTextNodeExpression(node.nodeValue);
		}
		const replacedText: string = expressions.reduce((p: string, c: ExpressionFunction | string) => {
			let text: string;
			if (typeof c === 'function') { // instanceOf ExpressionFunction ?;
				text = this.resolve(c as ExpressionFunction, instance, instance);
				if (text == undefined) { // !!! keep == loose equality
					text = '';
				}
			} else {
				text = c;
			}
			return p + text;
		}, '') as string;
		if (node.nodeValue !== replacedText) {
			const textNode: IText = document.createTextNode(replacedText) as IText;
			textNode.nodeExpressions = expressions;
			node.parentNode.replaceChild(textNode, node);
		}
	}

	pushFragment(nodeValue: string, from: number, to: number, expressions: (ExpressionFunction | string)[]): void {
		const fragment: string = nodeValue.substring(from, to);
		expressions.push(fragment);
	};

	parseTextNodeExpression(nodeValue: string): (ExpressionFunction | string)[] {
		const expressions: (ExpressionFunction | string)[] = [];
		const regex: RegExp = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
		let lastIndex: number = 0,
			matches: RegExpExecArray;
		/*
		const pushFragment = function (from: number, to: number): void {
			const fragment = nodeValue.substring(from, to);
			expressions.push(fragment);
		};
		*/
		while ((matches = regex.exec(nodeValue)) !== null) {
			const index: number = regex.lastIndex - matches[0].length;
			if (index > lastIndex) {
				this.pushFragment(nodeValue, index, lastIndex, expressions);
			}
			lastIndex = regex.lastIndex;
			const expression: ExpressionFunction = this.makeFunction(matches[1]);
			expressions.push(expression);
		}
		const length: number = nodeValue.length;
		if (length > lastIndex) {
			this.pushFragment(nodeValue, lastIndex, length, expressions);
		}
		return expressions;
	}

	resolve(expression: ExpressionFunction, parentInstance: Factory | Window, payload: any): any {
		// console.log(expression, parentInstance, payload);
		return expression.apply(parentInstance, [payload, this]);
	}

	makeHosts(meta: IFactoryMeta, instance: Factory, node: IElement): void {
		if (meta.hosts) {
			Object.keys(meta.hosts).forEach((key: string) => {
				const factory: typeof Factory = meta.hosts[key];
				instance[key] = getHost(instance, factory, node);
			});
		}
	}

	makeInput(instance: Factory, key: string): ExpressionFunction {
		const { node } = getContext(instance);
		let input: ExpressionFunction, expression: string = null;
		if (node.hasAttribute(`[${key}]`)) {
			expression = node.getAttribute(`[${key}]`);
		} else if (node.hasAttribute(key)) {
			// const attribute = node.getAttribute(key).replace(/{{/g, '"+').replace(/}}/g, '+"');
			const attribute: string = node.getAttribute(key).replace(/({{)|(}})|(")/g, function (substring: string, a, b, c) {
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
		if (expression !== null) {
			input = this.makeFunction(expression);
		}
		return input;
	}

	makeInputs(meta: IFactoryMeta, instance: Factory): { [key: string]: ExpressionFunction } {
		const inputs: { [key: string]: ExpressionFunction } = {};
		if (meta.inputs) {
			meta.inputs.forEach((key: string, i: number) => {
				const input = this.makeInput(instance, key);
				if (input) {
					inputs[key] = input;
				}
			});
		}
		return inputs;
	}

	makeOutput(instance: Factory, key: string): ExpressionFunction {
		const context: IContext = getContext(instance);
		const node: IElement = context.node;
		const parentInstance: Factory | Window = context.parentInstance;
		const expression: string = node.getAttribute(`(${key})`);
		const outputFunction: ExpressionFunction = this.makeFunction(expression, ['$event']);
		const output$: Observable<any> = new Subject<any>().pipe(
			tap((event) => {
				this.resolve(outputFunction, parentInstance, event);
			})
		);
		output$.pipe(
			takeUntil(instance.unsubscribe$)
		).subscribe();
		instance[key] = output$;
		return outputFunction;
	}

	makeOutputs(meta: IFactoryMeta, instance: Factory): { [key: string]: ExpressionFunction } {
		const outputs: { [key: string]: ExpressionFunction } = {};
		if (meta.outputs) {
			meta.outputs.forEach((key: string, i: number) => {
				outputs[key] = this.makeOutput(instance, key);
			});
		}
		return outputs;
	}

	resolveInputsOutputs(instance: Factory, changes: Factory | Window): void {
		const context: IContext = getContext(instance);
		const parentInstance: Factory | Window = context.parentInstance;
		const inputs: { [key: string]: ExpressionFunction } = context.inputs;
		for (let key in inputs) {
			const inputFunction: ExpressionFunction = inputs[key];
			const value: any = this.resolve(inputFunction, parentInstance, instance);
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
	}

	destroy(): void {
		this.remove(this.meta.node);
		this.meta.node.innerHTML = this.meta.nodeInnerHTML;
	}

	remove(node: Node, keepInstance?: Factory): Node {
		const keepContext: IContext = keepInstance ? getContext(keepInstance) : undefined;
		Module.traverseDown(node, (node: IElement) => {
			const rxcompId: number = node.rxcompId;
			if (rxcompId) {
				const keepContexts: IContext[] = Module.deleteContext(rxcompId, keepContext);
				if (keepContexts.length === 0) {
					delete node.rxcompId;
				}
			}
		});
		return node;
	}

	static parseExpression(expression: string): string {
		const l: string = '┌';
		const r: string = '┘';
		const rx1: RegExp = /(\()([^\(\)]*)(\))/;
		while (expression.match(rx1)) {
			expression = expression.replace(rx1, function (substring: string, ...args: any[]) {
				return `${l}${Module.parsePipes(args[1])}${r}`;
			});
		}
		expression = Module.parsePipes(expression);
		expression = expression.replace(/(┌)|(┘)/g, function (substring: string, ...args) {
			return args[0] ? '(' : ')';
		});
		return Module.parseOptionalChaining(expression);
	}

	static parsePipes(expression: string): string {
		const l: string = '┌';
		const r: string = '┘';
		const rx1: RegExp = /(.*?[^\|])\|([^\|]+)/;
		while (expression.match(rx1)) {
			expression = expression.replace(rx1, function (substring: string, ...args: any[]) {
				const value: string = args[0].trim();
				const params: string[] = Module.parsePipeParams(args[1]);
				const func: string = params.shift().trim();
				return `$$pipes.${func}.transform┌${[value, ...params]}┘`;
			});
		}
		return expression;
	}

	static parsePipeParams(expression: string): string[] {
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

	static parseOptionalChaining(expression: string): string {
		const regex: RegExp = /(\w+(\?\.))+([\.|\w]+)/g;
		let previous: string;
		expression = expression.replace(regex, function (substring: string, ...args: any[]) {
			const tokens: string[] = substring.split('?.');
			for (let i: number = 0; i < tokens.length - 1; i++) {
				const a: string = i > 0 ? `(${tokens[i]} = ${previous})` : tokens[i];
				const b: string = tokens[i + 1];
				previous = i > 0 ? `${a}.${b}` : `(${a} ? ${a}.${b} : void 0)`;
			}
			return previous || '';
		});
		return expression;
	}

	static makeContext(module: Module, instance: Factory, parentInstance: Factory | Window, node: IElement, factory: typeof Factory, selector: string): IContext {
		instance.rxcompId = ++ID;
		const context: IContext = { module, instance, parentInstance, node, factory, selector };
		const rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
		const nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
		nodeContexts.push(context);
		CONTEXTS[instance.rxcompId] = context;
		return context;
	}

	static deleteContext(id: number, keepContext: IContext): IContext[] {
		const keepContexts: IContext[] = [];
		const nodeContexts: IContext[] = NODES[id];
		if (nodeContexts) {
			nodeContexts.forEach((context: IContext) => {
				if (context === keepContext) {
					keepContexts.push(keepContext);
				} else {
					const instance: Factory = context.instance;
					instance.unsubscribe$.next();
					instance.unsubscribe$.complete();
					if (typeof instance['onDestroy'] === 'function') {
						instance['onDestroy']();
						delete CONTEXTS[instance.rxcompId];
					}
				}
			});
			if (keepContexts.length) {
				NODES[id] = keepContexts;
			} else {
				delete NODES[id];
			}
		}
		return keepContexts;
	}

	static matchSelectors(node: HTMLElement, selectors: SelectorFunction[], results: ISelectorResult[]): ISelectorResult[] {
		for (let i: number = 0; i < selectors.length; i++) {
			const selectorResult: ISelectorResult | false = selectors[i](node);
			if (selectorResult) {
				const factory: typeof Factory = selectorResult.factory;
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

	static querySelectorsAll(node: Node, selectors: SelectorFunction[], results: ISelectorResult[]): ISelectorResult[] {
		if (node.nodeType === 1) {
			const selectorResults: ISelectorResult[] = this.matchSelectors(node as HTMLElement, selectors, []);
			results = results.concat(selectorResults);
			const structure: ISelectorResult = selectorResults.find(x => x.factory.prototype instanceof Structure);
			if (structure) {
				return results;
			}
			const childNodes: NodeListOf<ChildNode> = node.childNodes;
			for (let i: number = 0; i < childNodes.length; i++) {
				results = this.querySelectorsAll(childNodes[i], selectors, results);
			}
		}
		return results;
	}

	static traverseUp(node: Node, callback: (node: Node, i: number) => any, i: number = 0): any {
		if (!node) {
			return;
		}
		const result = callback(node, i);
		if (result) {
			return result;
		}
		return this.traverseUp(node.parentNode, callback, i + 1);
	}

	static traverseDown(node: Node, callback: (node: Node, i: number) => any, i: number = 0): any {
		if (!node) {
			return;
		}
		let result = callback(node, i);
		if (result) {
			return result;
		}
		if (node.nodeType === 1) {
			let j = 0,
				t = node.childNodes.length;
			while (j < t && !result) {
				result = this.traverseDown(node.childNodes[j], callback, i + 1);
				j++;
			}
		}
		return result;
	}

	static traversePrevious(node: Node, callback: (node: Node, i: number) => any, i: number = 0): any {
		if (!node) {
			return;
		}
		const result = callback(node, i);
		if (result) {
			return result;
		}
		return this.traversePrevious(node.previousSibling, callback, i + 1);
	}

	static traverseNext(node: Node, callback: (node: Node, i: number) => any, i: number = 0): any {
		if (!node) {
			return;
		}
		const result = callback(node, i);
		if (result) {
			return result;
		}
		return this.traverseNext(node.nextSibling, callback, i + 1);
	}

	static meta: IModuleMeta;

}

export function getContext(instance: Factory): IContext {
	return CONTEXTS[instance.rxcompId];
}

export function getContextByNode(node: Node): IContext | void {
	let context: IContext;
	const rxcompId: number = node['rxcompId'];
	if (rxcompId) {
		const nodeContexts: IContext[] = NODES[rxcompId];
		if (nodeContexts) {
			context = nodeContexts.reduce((previous: IContext, current: IContext) => {
				if (current.factory.prototype instanceof Component) {
					return current;
				} else if (current.factory.prototype instanceof Context) {
					return previous ? previous : current;
				} else {
					return previous;
				}
			}, null);
			// console.log(node.rxcompId, context);
		}
	}
	return context;
}

export function getHost(instance: Factory, factory: typeof Factory, node: IElement): Factory {
	if (!node) {
		node = getContext(instance).node;
	}
	if (node.rxcompId) {
		const nodeContexts: IContext[] = NODES[node.rxcompId];
		if (nodeContexts) {
			// console.log(nodeContexts);
			for (let i: number = 0; i < nodeContexts.length; i++) {
				const context: IContext = nodeContexts[i];
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
		return getHost(instance, factory, node.parentNode as IElement);
	}
}
