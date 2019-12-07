import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Component from '../core/component';
import Context from '../core/context';

let ID = 0;
const CONTEXTS = {};
const NODES = {};
const REMOVED_IDS = [];

export default class Module {

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
		// console.log('compile', instances, node, parentInstance);
		return instances;
	}

	makeInstance(node, factory, selector, parentInstance, args) {
		if (parentInstance || node.parentNode) {
			const isComponent = factory.prototype instanceof Component;
			const meta = factory.meta;
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
			instance.pushChanges = function() {
				// console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
				this.changes$.next(this);
				// parse component text nodes
				if (isComponent) {
					// console.log('Module.parse', instance.constructor.name);
					initialized ? module.parse(node, instance) : setTimeout(function() { module.parse(node, instance); });
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
			/*
			// parse component text nodes
			if (isComponent) {
				this.parse(node, instance);
			}
			*/
			return instance;
		}
	}

	makeContext(instance, parentInstance, node, selector) {
		const context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
		// console.log('Module.makeContext', context, context.instance, context.node);
		return context;
	}

	makeFunction(expression, params = ['$instance']) {
		if (!expression) {
			return () => { return null; };
		}
		const args = params.join(',');
		const pipes = this.meta.pipes;
		const transforms = Module.getPipesSegments(expression);
		expression = transforms.shift().trim();
		expression = this.transformOptionalChaining(expression);
		// console.log(pipes, transforms, expression);
		// console.log(transforms.length, params);
		// keyword 'this' represents changes from func.apply(changes, instance)
		if (transforms.length) {
			expression = transforms.reduce((expression, transform, i) => {
				const params = Module.getPipeParamsSegments(transform);
				const name = params.shift().trim();
				const pipe = pipes[name];
				if (!pipe || typeof pipe.transform !== 'function') {
					throw (`missing pipe '${name}'`);
				}
				return `$$pipes.${name}.transform(${expression},${params.join(',')})`;
			}, expression);
			// console.log('expression', expression);
			const expression_func = new Function(`with(this) {
				return (function (${args}, $$module) {
					const $$pipes = $$module.meta.pipes;
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`);
			return expression_func;
		} else {
			// console.log('expression', args, expression);
			// console.log('${expression.replace(/\'/g,'"')}', this);
			const expression_func = new Function(`with(this) {
				return (function (${args}, $$module) {
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`);
			return expression_func;
		}
	}

	makeInput(instance, key) {
		const { node } = getContext(instance);
		let input, expression = null;
		if (node.hasAttribute(key)) {
			expression = `'${node.getAttribute(key)}'`;
		} else if (node.hasAttribute(`[${key}]`)) {
			expression = node.getAttribute(`[${key}]`);
		}
		if (expression !== null) {
			input = this.makeFunction(expression);
		}
		return input;
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

	remove(node) {
		Module.traverseDown(node, (node) => {
			for (let id in CONTEXTS) {
				const context = CONTEXTS[id];
				if (context.node === node) {
					const instance = context.instance;
					instance.unsubscribe$.next();
					instance.unsubscribe$.complete();
					if (typeof instance.onDestroy === 'function') {
						instance.onDestroy();
					}
					delete node.dataset.rxcompId;
					REMOVED_IDS.push(id);
				}
			}
		});
		// console.log('Module.remove', REMOVED_IDS);
		while (REMOVED_IDS.length) {
			Module.deleteContext(REMOVED_IDS.shift());
		}
		return node;
	}

	destroy() {
		this.remove(this.meta.node);
		this.meta.node.innerHTML = this.meta.nodeInnerHTML;
	}

	evaluate(text, instance) {
		const parse_eval_ = (...args) => {
			const expression = args[1];
			// console.log('expression', expression);
			try {
				const parse_func_ = this.makeFunction(expression);
				return this.resolve(parse_func_, instance, instance);
			} catch (e) {
				console.error(e);
				return e.message;
			}
		};
		return text.replace(/\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g, parse_eval_);
		// return text.replace(/\{{2}((([^{}])|(\{[^{}]+?\}))*?)\}{2}/g, parse_eval_);
	}

	parse(node, instance) {
		// console.log('parse', instance.constructor.name, node);
		for (let i = 0; i < node.childNodes.length; i++) {
			const child = node.childNodes[i];
			if (child.nodeType === 1) {
				const context = getContextByNode(child);
				if (!context) {
					this.parse(child, instance);
				}
			} else if (child.nodeType === 3) {
				const expression = child.nodeExpression || child.nodeValue;
				const replacedText = this.evaluate(expression, instance);
				if (expression !== replacedText) {
					const textNode = document.createTextNode(replacedText);
					textNode.nodeExpression = expression;
					node.replaceChild(textNode, child);
				}
			}
		}
	}

	resolve(expressionFunc, changes, payload) {
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
	};

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

	transformOptionalChaining(expression) {
		const regex = /(\w+(\?\.))+([\.|\w]+)/g;
		let previous;
		expression = expression.replace(regex, (...args) => {
			const tokens = args[0].split('?.');
			for (let i = 0; i < tokens.length - 1; i++) {
				const a = i > 0 ? `(${tokens[i]} = ${previous})` : tokens[i];
				const b = tokens[i + 1];
				previous = i > 0 ? `${a}.${b}` : `(${a} ? ${a}.${b} : void 0)`;
				// log(previous);
			}
			return previous || '';
		});
		return expression;
	}

	static getPipesSegments(expression) {
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
			if (c === '|' && block === 0) {
				if (word.length) {
					segments.push(word);
				}
				word = '';
			} else {
				word += c;
			}
			i++;
		}
		if (word.length) {
			segments.push(word);
		}
		return segments;
	}

	static getPipeParamsSegments(expression) {
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
					segments.push(word);
				}
				word = '';
			} else {
				word += c;
			}
			i++;
		}
		if (word.length) {
			segments.push(word);
		}
		return segments;
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
			}
		}
		return results;
	}

	static querySelectorsAll(node, selectors, results) {
		if (node.nodeType === 1) {
			results = this.matchSelectors(node, selectors, results);
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

	static makeContext(module, instance, parentInstance, node, factory, selector) {
		instance.rxcompId = ++ID;
		const context = { module, instance, parentInstance, node, factory, selector };
		const rxcompNodeId = node.dataset.rxcompId = (node.dataset.rxcompId || instance.rxcompId);
		const nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
		nodeContexts.push(context);
		return CONTEXTS[instance.rxcompId] = context;
	}

	static deleteContext(id) {
		const context = CONTEXTS[id];
		const nodeContexts = NODES[context.node.dataset.rxcompId];
		if (nodeContexts) {
			const index = nodeContexts.indexOf(context);
			if (index !== -1) {
				nodeContexts.splice(index, 1);
			}
		}
		delete CONTEXTS[id];
	}

}

export function getContext(instance) {
	return CONTEXTS[instance.rxcompId];
}

export function getContextByNode(node) {
	let context;
	const nodeContexts = NODES[node.dataset.rxcompId];
	if (nodeContexts) {
		/*
		const same = nodeContexts.reduce((p, c) => {
			return p && c.node === node;
		}, true);
		console.log('same', same);
		*/
		context = nodeContexts.reduce((previous, current) => {
			if (current.factory.prototype instanceof Component) {
				return current;
			} else if (current.factory.prototype instanceof Context) {
				return previous ? previous : current;
			} else {
				return previous;
			}
		}, null);
		// console.log(node.dataset.rxcompId, context);
	}
	return context;
}

export function getHost(instance, factory, node) {
	if (!node) {
		node = getContext(instance).node;
	}
	if (!node.dataset) {
		return;
	}
	const nodeContexts = NODES[node.dataset.rxcompId];
	if (nodeContexts) {
		// console.log(nodeContexts);
		// let hasComponent;
		for (let i = 0; i < nodeContexts.length; i++) {
			const context = nodeContexts[i];
			if (context.instance !== instance) {
				// console.log(context.instance, instance);
				if (context.instance instanceof factory) {
					return context.instance;
				}
				/*
				else if (context.instance instanceof Component) {
					hasComponent = true;
				}
				*/
			}
		}
		/*
		if (hasComponent) {
			return undefined;
		}
		*/
	}
	if (node.parentNode) {
		return getHost(instance, factory, node.parentNode);
	}
}
