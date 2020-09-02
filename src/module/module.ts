import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Component from '../core/component';
import Context from '../core/context';
import Factory, { CONTEXTS, getContext, NODES } from '../core/factory';
import Structure from '../core/structure';
import { ExpressionFunction, IContext, IElement, IFactoryMeta, IModuleMeta, IModuleParsedMeta, ISelectorResult, IText, SelectorFunction } from '../core/types';
import { ExpressionError, nextError$ } from '../error/error';
import { isPlatformBrowser } from '../platform/platform';

let ID: number = 0;

export default class Module {
	meta?: IModuleParsedMeta;
	instances?: Factory[];
	unsubscribe$: Subject<void> = new Subject();
	static forRoot?: (...args: any[]) => typeof Module;
	public compile(node: IElement, parentInstance?: Factory | Window): Factory[] {
		let componentNode: IElement;
		const instances: Factory[] = Module.querySelectorsAll(node, this.meta!.selectors, []).map((match: ISelectorResult) => {
			if (componentNode && componentNode !== match.node) {
				parentInstance = undefined;
			}
			const instance: Factory | undefined = this.makeInstance(match.node, match.factory, match.selector, parentInstance);
			if (match.factory.prototype instanceof Component) {
				componentNode = match.node;
			}
			return instance;
		}).filter((x): x is Factory => x !== undefined);
		// instances.forEach(x => x.onInit());
		// console.log('compile', instances, node, parentInstance);
		return instances;
	}
	public makeInstance(node: IElement, factory: typeof Factory, selector: string, parentInstance?: Factory | Window, args?: any[], inject?: { [key: string]: any }, skipSubscription: boolean = false): Factory | undefined {
		if (parentInstance || node.parentNode) {
			const meta: IFactoryMeta = factory.meta;
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
			if (!(instance instanceof Context)) {
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
			if (!skipSubscription) {
				this.makeInstanceSubscription(instance, parentInstance);
			}
			return instance;
		} else {
			return undefined;
		}
	}
	public makeInstanceSubscription(instance: Factory, parentInstance?: Factory | Window): void {
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
				takeUntil(instance.unsubscribe$)
			).subscribe((changes: Factory | Window) => {
				// console.log('Module.makeInstanceSubscription.changes', instance);
				// resolve component input outputs
				if (!(instance instanceof Context)) {
					this.resolveInputsOutputs(instance, changes);
				}
				// calling onChanges event with changes
				instance.onChanges(changes);
				// push instance changes for subscribers
				instance.pushChanges();
			});
		}
	}
	public makeFunction(expression: string, params: string[] = ['$instance']): ExpressionFunction {
		if (expression) {
			expression = Module.parseExpression(expression);
			const args: string = params.join(',');
			const expressionFunction: string = `with(this) {
				return (function (${args}, $$module) {
					try {
						const $$pipes = $$module.meta.pipes;
						return ${expression};
					} catch(error) {
						$$module.nextError(error, this, ${JSON.stringify(expression)}, arguments);
					}
				}.bind(this)).apply(this, arguments);
			}`;
			// console.log('Module.makeFunction.expressionFunction', expressionFunction);
			const expression_func: ExpressionFunction = new Function(expressionFunction) as ExpressionFunction;
			// console.log(this, $$module, $$pipes, "${expression}");
			// console.log(expression_func);
			return expression_func;
		} else {
			return () => { return null; };
		}
	}
	public nextError(error: Error, instance: Factory, expression: string, params: any[]): void {
		const expressionError: ExpressionError = new ExpressionError(error, this, instance, expression, params);
		nextError$.next(expressionError);
	}
	public resolve(expression: ExpressionFunction, parentInstance: Factory | Window, payload: any): any {
		// console.log('Module.resolve', expression, parentInstance, payload, getContext);
		return expression.apply(parentInstance, [payload, this]);
	}
	public parse(node: HTMLElement, instance: Factory): void {
		for (let i: number = 0; i < node.childNodes.length; i++) {
			const child: ChildNode = node.childNodes[i];
			if (child.nodeType === 1) {
				const element: HTMLElement = child as HTMLElement;
				const context: IContext | undefined = getParsableContextByElement(element);
				if (!context) {
					this.parse(element, instance);
				}
				// else { console.log('Module.parse', element, context.instance); }
			} else if (child.nodeType === 3) {
				const text: IText = child as IText;
				/*
				if (text.nodeValue!.trim() !== '') {
					// console.log('Module.parse', text.nodeValue, instance);
				}
				*/
				this.parseTextNode(text, instance);
			}
		}
	}
	public remove(node: Node, keepInstance?: Factory): Node {
		const keepContext: IContext | undefined = keepInstance ? getContext(keepInstance) : undefined;
		Module.traverseDown(node, (node: Node) => {
			const rxcompId: number | undefined = (node as IElement).rxcompId;
			if (rxcompId) {
				const keepContexts: IContext[] = Module.deleteContext(rxcompId, keepContext);
				if (keepContexts.length === 0) {
					delete (node as IElement).rxcompId;
				}
			}
		});
		return node;
	}
	public destroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.remove(this.meta!.node);
		this.meta!.node.innerHTML = this.meta!.nodeInnerHTML;
	}
	protected makeContext(instance: Factory, parentInstance: Factory | Window, node: IElement, selector: string): IContext {
		const context: IContext = Module.makeContext(this, instance, parentInstance, node, instance.constructor as typeof Factory, selector);
		// console.log('Module.makeContext', context, context.instance, context.node);
		return context;
	}
	protected getInstance(node: HTMLElement | Document): Factory | Window | undefined {
		if (node === document) {
			return (isPlatformBrowser ? window : global) as Window;
		}
		const context: IContext | undefined = getContextByNode(node as HTMLElement);
		if (context) {
			return context.instance;
		} else {
			return undefined;
		}
	}
	protected getParentInstance(node: Node | null): Factory | Window {
		return Module.traverseUp(node, (node: Node) => {
			return this.getInstance(node as HTMLElement);
		});
	}
	protected parseTextNode(node: IText, instance: Factory): void {
		let expressions: (ExpressionFunction | string)[] | undefined = node.nodeExpressions;
		if (!expressions) {
			expressions = this.parseTextNodeExpression(node.wholeText);
		}
		if (expressions.length) {
			const replacedText: string = expressions.reduce((p: string, c: ExpressionFunction | string) => {
				let text: string;
				if (typeof c === 'function') { // instanceOf ExpressionFunction ?;
					// console.log('Module.parseTextNode', c, instance);
					text = this.resolve(c as ExpressionFunction, instance, instance);
					if (text == undefined) { // !!! keep == loose equality
						text = '';
					}
				} else {
					text = c;
				}
				return p + text;
			}, '');
			if (node.nodeValue !== replacedText) {
				const textNode: IText = document.createTextNode(replacedText) as IText;
				textNode.nodeExpressions = expressions;
				node.parentNode!.replaceChild(textNode, node);
			}
		} else {
			node.nodeExpressions = expressions;
		}
	}
	protected pushFragment(nodeValue: string, from: number, to: number, expressions: (ExpressionFunction | string)[]): void {
		const fragment: string = nodeValue.substring(from, to);
		expressions.push(fragment);
	}
	protected parseTextNodeExpression(nodeValue: string): (ExpressionFunction | string)[] {
		const expressions: (ExpressionFunction | string)[] = [];
		const regex: RegExp = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
		let lastIndex: number = 0,
			matches: RegExpExecArray | null;
		while ((matches = regex.exec(nodeValue)) !== null) {
			const index: number = regex.lastIndex - matches[0].length;
			if (index > lastIndex) {
				this.pushFragment(nodeValue, index, lastIndex, expressions);
			}
			lastIndex = regex.lastIndex;
			const expression: ExpressionFunction = this.makeFunction(matches[1]);
			expressions.push(expression);
		}
		// console.log('Module.parseTextNodeExpression', regex.source, expressions, nodeValue);
		const length: number = nodeValue.length;
		if (length > lastIndex) {
			this.pushFragment(nodeValue, lastIndex, length, expressions);
		}
		if (expressions.find(x => typeof x === 'function')) {
			return expressions;
		} else {
			return [];
		}
	}
	protected makeHosts(meta: IFactoryMeta, instance: Factory, node: IElement): void {
		if (meta.hosts) {
			Object.keys(meta.hosts).forEach((key: string) => {
				const factory: typeof Factory = meta.hosts![key];
				instance[key] = getHost(instance, factory, node);
			});
		}
	}
	protected makeInput(instance: Factory, key: string): ExpressionFunction | null {
		const { node } = getContext(instance);
		let input: ExpressionFunction | null = null,
			expression: string | null = null;
		if (node.hasAttribute(`[${key}]`)) {
			expression = node.getAttribute(`[${key}]`)!;
			// console.log('Module.makeInput.expression.1', expression);
		} else if (node.hasAttribute(key)) {
			// const attribute = node.getAttribute(key).replace(/{{/g, '"+').replace(/}}/g, '+"');
			const attribute: string = node.getAttribute(key)!.replace(/({{)|(}})|(")/g, function (substring: string, a, b, c) {
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
			// console.log('Module.makeInput.expression.2', expression);
		}
		if (expression) {
			input = this.makeFunction(expression);
		}
		/*
		const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(instance, key) as PropertyDescriptor;
		if (!descriptor) {
			Object.defineProperty(instance, key, {
				value: null,
				enumerable: true,
				writable: true,
				configurable: false,
			});
		}
		*/
		// console.log('Module.makeInput', key, instance, descriptor);
		return input;
	}
	protected makeInputs(meta: IFactoryMeta, instance: Factory): { [key: string]: ExpressionFunction } {
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
	protected makeOutput(instance: Factory, key: string): Observable<any> {
		const context: IContext = getContext(instance);
		const node: IElement = context.node;
		const parentInstance: Factory | Window = context.parentInstance;
		const expression: string | null = node.getAttribute(`(${key})`);
		const outputFunction: ExpressionFunction | null = expression ? this.makeFunction(expression, ['$event']) : null;
		const output$: Observable<any> = new Subject<any>().pipe(
			tap((event) => {
				if (outputFunction) {
					// console.log(expression, parentInstance);
					this.resolve(outputFunction, parentInstance, event);
				}
			})
		);
		output$.pipe(
			takeUntil(instance.unsubscribe$)
		).subscribe();
		instance[key] = output$;
		return output$;
	}
	protected makeOutputs(meta: IFactoryMeta, instance: Factory): { [key: string]: Observable<any> } {
		const outputs: { [key: string]: Observable<any> } = {};
		if (meta.outputs) {
			meta.outputs.forEach((key: string) => {
				const output = this.makeOutput(instance, key);
				if (output) {
					outputs[key] = output;
				}
			});
		}
		return outputs;
	}
	protected resolveInputsOutputs(instance: Factory, changes: Factory | Window): void {
		const context: IContext = getContext(instance);
		const parentInstance: Factory | Window = context.parentInstance;
		const inputs: { [key: string]: ExpressionFunction } = context.inputs!;
		for (let key in inputs) {
			const inputFunction: ExpressionFunction = inputs[key];
			// console.log('Module.inputFunction', inputFunction);
			const value: any = this.resolve(inputFunction, parentInstance, instance);
			instance[key] = value;
		}
	}
	protected static parseExpression(expression: string): string {
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
	protected static parsePipes(expression: string): string {
		const l: string = '┌';
		const r: string = '┘';
		const rx1: RegExp = /(.*?[^\|])\|([^\|]+)/;
		while (expression.match(rx1)) {
			expression = expression.replace(rx1, function (substring: string, ...args: any[]) {
				const value: string = args[0].trim();
				const params: string[] = Module.parsePipeParams(args[1]);
				const func: string = params.shift()!.trim();
				return `$$pipes.${func}.transform${l}${[value, ...params]}${r}`;
			});
		}
		return expression;
	}
	protected static parsePipeParams(expression: string): string[] {
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
	protected static parseOptionalChaining(expression: string): string {
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
	protected static makeContext(module: Module, instance: Factory, parentInstance: Factory | Window, node: IElement, factory: typeof Factory, selector: string): IContext {
		instance.rxcompId = ++ID;
		const context: IContext = { module, instance, parentInstance, node, factory, selector };
		const rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
		const nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
		nodeContexts.push(context);
		CONTEXTS[instance.rxcompId] = context;
		return context;
	}
	protected static deleteContext(id: number, keepContext: IContext | undefined): IContext[] {
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
					instance.onDestroy();
					delete CONTEXTS[instance.rxcompId];
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
	protected static matchSelectors(node: HTMLElement, selectors: SelectorFunction[], results: ISelectorResult[]): ISelectorResult[] {
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
	protected static querySelectorsAll(node: Node, selectors: SelectorFunction[], results: ISelectorResult[]): ISelectorResult[] {
		if (node.nodeType === 1) {
			const selectorResults: ISelectorResult[] = this.matchSelectors(node as HTMLElement, selectors, []);
			results = results.concat(selectorResults);
			const structure: ISelectorResult | undefined = selectorResults.find(x => x.factory.prototype instanceof Structure);
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
	protected static traverseUp(node: Node | null, callback: (node: Node, i: number) => any, i: number = 0): any {
		if (!node) {
			return;
		}
		const result = callback(node, i);
		if (result) {
			return result;
		}
		return this.traverseUp(node.parentNode, callback, i + 1);
	}
	protected static traverseDown(node: Node | null, callback: (node: Node, i: number) => any, i: number = 0): any {
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
	protected static traversePrevious(node: Node | null, callback: (node: Node, i: number) => any, i: number = 0): any {
		if (!node) {
			return;
		}
		const result = callback(node, i);
		if (result) {
			return result;
		}
		return this.traversePrevious(node.previousSibling, callback, i + 1);
	}
	protected static traverseNext(node: Node | null, callback: (node: Node, i: number) => any, i: number = 0): any {
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
export function getParsableContextByElement(element: HTMLElement): IContext | undefined {
	let context: IContext | undefined;
	const rxcompId: number | undefined = (element as IElement).rxcompId;
	if (rxcompId) {
		const contexts: IContext[] | undefined = NODES[rxcompId];
		if (contexts) {
			context = contexts.reduce(
				(previous: IContext | undefined, current: IContext) => {
					if (current.instance instanceof Context) {
						return previous ? previous : current;
					} else if (current.instance instanceof Component) {
						return current;
					} else {
						return previous;
					}
				},
				undefined
			);
		}
		// context = contexts ? contexts.find(x => x.instance instanceof Component) : undefined;
	}
	return context;
}
export function getContextByNode(element: HTMLElement): IContext | undefined {
	let context: IContext | undefined = getParsableContextByElement(element);
	if (context && context.factory.prototype instanceof Structure) {
		return undefined;
	}
	return context;
}
export function getHost(instance: Factory, factory: typeof Factory, node: IElement): Factory | undefined {
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
	} else {
		return undefined;
	}
}
