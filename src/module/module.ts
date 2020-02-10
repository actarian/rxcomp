import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Factory, { SelectorFunction } from 'src/core/factory';
import Pipe from 'src/core/pipe';
import Component from '../core/component';
import Context from '../core/context';
import Structure from '../core/structure';

let ID = 0;
const CONTEXTS = {};
const NODES = {};

export class ModuleContext {
	module: Module;
	instance: Function;
	parentInstance: Function;
	node: HTMLElement;
	factory: Function;
	selector: string;
	inputs?: {};
	outputs?: {};
}

export interface IModuleMeta {
	imports: (typeof Module | IModuleMeta)[];
	declarations: (typeof Factory | Pipe)[];
	exports: (typeof Factory | Pipe)[];
	pipes: Pipe[];
	factories: typeof Factory[];
	selectors: SelectorFunction[];
	node?: HTMLElement;
	nodeInnerHTML?: string;
	bootstrap: typeof Factory;
}

export default class Module {

	meta: IModuleMeta;

	compile(node, parentInstance): Factory[] {
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
		// console.log('compile', instances, node, parentInstance);
		return instances;
	}

	makeInstance(node, factory, selector, parentInstance, args?: any) {
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
				if (typeof instance.onView === 'function') {
					// console.log('onView', instance.constructor.name);
					instance.onView();
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
			if (typeof instance.onInit === 'function') {
				instance.onInit();
			}
			initialized = true;
			// subscribe to parent changes
			if (parentInstance.changes$) {
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
				).subscribe(changes => {
					// resolve component input outputs
					// if (isComponent && meta) {
					if (meta) {
						this.resolveInputsOutputs(instance, changes);
					}
					// calling onChanges event with parentInstance
					if (typeof instance.onChanges === 'function') {
						// console.log('onChanges', instance.constructor.name);
						// console.log('onChanges', instance.constructor.meta.selector, changes);
						instance.onChanges(changes);
					}
					// push instance changes for subscribers
					instance.pushChanges();
				});
			}
			return instance;
		}
	}

	makeContext(instance, parentInstance, node, selector) {
		const context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
		// console.log('Module.makeContext', context, context.instance, context.node);
		return context;
	}

	makeFunction(expression, params = ['$instance']) {
		if (expression) {
			expression = Module.parseExpression(expression);
			// console.log(expression);
			const args = params.join(',');
			const expression_func = new Function(`with(this) {
				return (function (${args}, $$module) {
					const $$pipes = $$module.meta.pipes;
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`);
			// console.log(expression_func);
			return expression_func;
		} else {
			return () => { return null; };
		}
	}

	getInstance(node) {
		if (node === document) {
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
				const context = getContextByNode(child);
				if (!context) {
					this.parse(child, instance);
				}
			} else if (child.nodeType === 3) {
				this.parseTextNode(child, instance);
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
				if (text == undefined) { // !!! keep == loose equality
					text = '';
				}
			} else {
				text = c;
			}
			return p + text;
		}, '');
		if (node.nodeValue !== replacedText) {
			const textNode = document.createTextNode(replacedText) as any;
			textNode.nodeExpressions = expressions;
			node.parentNode.replaceChild(textNode, node);
		}
	}

	parseTextNodeExpression(expression) {
		const expressions = [];
		const regex = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
		let lastIndex = 0,
			matches;
		const pushFragment = function (from, to) {
			const fragment = expression.substring(from, to);
			expressions.push(fragment);
		};
		while ((matches = regex.exec(expression)) !== null) {
			const index = regex.lastIndex - matches[0].length;
			if (index > lastIndex) {
				pushFragment(index, lastIndex);
			}
			lastIndex = regex.lastIndex;
			const fragment = this.makeFunction(matches[1]);
			expressions.push(fragment);
		}
		const length = expression.length;
		if (length > lastIndex) {
			pushFragment(lastIndex, length);
		}
		return expressions;
	}

	resolve(expressionFunc, changes, payload) {
		// console.log(expressionFunc, changes, payload);
		return expressionFunc.apply(changes, [payload, this]);
	}

	makeHosts(meta, instance, node) {
		if (meta.hosts) {
			Object.keys(meta.hosts).forEach(key => {
				const factory = meta.hosts[key];
				instance[key] = getHost(instance, factory, node);
			});
		}
	}

	makeInput(instance, key) {
		const { node } = getContext(instance);
		let input, expression = null;
		if (node.hasAttribute(key)) {
			// const attribute = node.getAttribute(key).replace(/{{/g, '"+').replace(/}}/g, '+"');
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
		} else if (node.hasAttribute(`[${key}]`)) {
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
		const output$ = new Subject().pipe(
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
		/*
		const outputs = context.outputs;
		for (let key in outputs) {
			const inpuoutputFunctiontFunction = outputs[key];
			const value = this.resolve(outputFunction, parentInstance, null);
			// console.log(`setted -> ${key}`, value);
		}
		*/
	}

	destroy() {
		this.remove(this.meta.node);
		this.meta.node.innerHTML = this.meta.nodeInnerHTML;
	}

	remove(node, keepInstance?: any) {
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
			expression = expression.replace(rx1, function (...g1) {
				const value = g1[1].trim();
				const params = Module.parsePipeParams(g1[2]);
				const func = params.shift().trim();
				return `$$pipes.${func}.transform┌${[value, ...params]}┘`;
			});
		}
		return expression;
	}

	static parsePipeParams(expression) {
		const segments = [];
		let i = 0,
			word = '',
			block = 0;
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

	static parseOptionalChaining(expression) {
		const regex = /(\w+(\?\.))+([\.|\w]+)/g;
		let previous;
		expression = expression.replace(regex, function (...args) {
			const tokens = args[0].split('?.');
			for (let i = 0; i < tokens.length - 1; i++) {
				const a = i > 0 ? `(${tokens[i]} = ${previous})` : tokens[i];
				const b = tokens[i + 1];
				previous = i > 0 ? `${a}.${b}` : `(${a} ? ${a}.${b} : void 0)`;
			}
			return previous || '';
		});
		return expression;
	}

	static makeContext(module, instance, parentInstance, node, factory, selector): ModuleContext {
		instance.rxcompId = ++ID;
		const context = { module, instance, parentInstance, node, factory, selector };
		const rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
		const nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
		nodeContexts.push(context);
		return CONTEXTS[instance.rxcompId] = context;
	}

	static deleteContext(id, keepContext) {
		const keepContexts = [];
		const nodeContexts = NODES[id];
		if (nodeContexts) {
			nodeContexts.forEach(context => {
				if (context === keepContext) {
					keepContexts.push(keepContext);
				} else {
					const instance = context.instance;
					instance.unsubscribe$.next();
					instance.unsubscribe$.complete();
					if (typeof instance.onDestroy === 'function') {
						instance.onDestroy();
						delete CONTEXTS[instance.rxcompId];
					}
				}
			});
			if (keepContexts.length) {
				NODES[id] = keepContexts;;
			} else {
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
					// console.log('Structure', node);
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
			let j = 0,
				t = node.childNodes.length;
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

	static meta: IModuleMeta;

}

export function getContext(instance) {
	return CONTEXTS[instance.rxcompId];
}

export function getContextByNode(node) {
	let context;
	const nodeContexts = NODES[node.rxcompId];
	if (nodeContexts) {
		context = nodeContexts.reduce((previous, current) => {
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
}
