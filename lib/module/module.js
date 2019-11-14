import { BehaviorSubject, of , Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import Component from '../component/component';
import Context from '../context/context';

let ID = 0;
const CONTEXTS = {};
const NODES = {};

export default class Module {

	constructor(options) {
		if (!options) {
			throw ('missing options');
		}
		if (!options.bootstrap) {
			throw ('missing bootstrap');
		}
		this.options = options;
		const pipes = {};
		if (options.pipes) {
			options.pipes.forEach(x => pipes[x.meta.name] = x);
		}
		this.pipes = pipes;
		const bootstrap = options.bootstrap;
		this.node = document.querySelector(bootstrap.meta.selector);
		if (!this.node) {
			throw (`missing node ${bootstrap.meta.selector}`);
		}
		this.root = this.makeInstance(this.node, bootstrap, bootstrap.meta.selector, window);
		this.selectors = Module.unwrapSelectors(options.factories);
	}

	use$() {
		return of(Module.querySelectorsAll(this.node, this.selectors, [])).pipe(
			filter(matches => matches.length > 0),
			map((matches) => {
				return matches.map(match => this.makeInstance(match.node, match.factory, match.selector)).filter(x => x);
			}),
			tap(instances => instances.forEach(instance => {
				// parse component text nodes
				const context = Module.getContext(instance);
				const isComponent = context.factory.prototype instanceof Component;
				if (isComponent) {
					this.parse(context.node, instance);
				}
			})),
			shareReplay(1)
		);
	}

	makeContext(instance, parentInstance, node, selector) {
		const context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
		console.log('Module.makeContext', context, context.instance, context.node);
		return context;
	}

	makeInstance(node, factory, selector, parentInstance, args) {
		if (parentInstance || node.parentNode) {
			const isComponent = factory.prototype instanceof Component;
			const meta = factory.meta;
			// collect parentInstance scope
			parentInstance = parentInstance || this.getParentScope(node.parentNode);
			if (!parentInstance) {
				return;
			}
			// creating factory instance
			const instance = new factory(...(args || []));
			// injecting state$ and unsubscribe$ subjects
			Object.defineProperties(instance, {
				state$: {
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
			// injecting instance pushState method
			const moduleRef = this;
			instance.pushState = function() {
				if (isComponent) {
					moduleRef.parse(node, instance);
				}
				this.state$.next(this);
			};
			// creating instance context
			const context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
			// creating component input and outputs
			if (isComponent) {
				context.inputs = this.makeInputs(meta, instance);
				context.outputs = this.makeOutputs(meta, instance);
			}
			// calling onInit event
			if (typeof instance.onInit === 'function') {
				instance.onInit();
			}
			// subscribe to parent state
			if (parentInstance.state$) {
				parentInstance.state$.pipe(
					// filter(() => node.parentNode),
					takeUntil(instance.unsubscribe$)
				).subscribe(state => {
					// resolve component input outputs
					if (isComponent) {
						this.resolveInputsOutputs(instance, state);
					}
					// calling onState event with parentInstance
					if (typeof instance.onState === 'function') {
						// console.log('onState', instance.constructor.meta.selector, state);
						instance.onState(state);
					}
					// push instance state for subscribers
					instance.pushState();
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

	remove(node) {
		const ids = [];
		Module.traverseDown(node, (node) => {
			for (let [id, context] of Object.entries(CONTEXTS)) {
				if (context.node === node) {
					const instance = context.instance;
					instance.unsubscribe$.next();
					instance.unsubscribe$.complete();
					if (typeof instance.onDestroy === 'function') {
						instance.onDestroy();
					}
					ids.push(id);
				}
			}
		});
		ids.forEach(id => Module.deleteContext(id));
		// console.log('Module.remove', ids);
		return node;
	}

	compile(node, context) {
		console.log('Module.compile', context);
		const matches = Module.querySelectorsAll(node, this.selectors, []);
		const instances = matches.map(match => {
			const instance = this.makeInstance(match.node, match.factory, match.selector, context ? context.instance : undefined);
			if (match.factory.prototype instanceof Component) {
				context = undefined; // !!!
			}
			return instance;
		}).filter(x => x !== undefined);
		return instances;
	}

	evaluate(text, instance) {
		const parse_eval_ = (...args) => {
			const expression = args[1];
			// console.log('expression', expression);
			const parse_func_ = this.makeFunction(expression);
			return this.resolve(parse_func_, instance, instance);
		};
		// console.log(text);
		return text.replace(/\{{2}(?!\{)(.*?\}*)\}{2}/g, parse_eval_);
	}

	parse(node, instance) {
		// console.log('node', node.childNodes.length, node);
		/*
		if (node.hasAttribute('[innerHTML]')) {
			const innerHTML = `{{${node.getAttribute('[innerHTML]')}}}`;
			node.innerHTML = parse_replace_(innerHTML);
		} else if (node.hasAttribute('innerHTML')) {
			const innerHTML = node.getAttribute('innerHTML');
			node.innerHTML = parse_replace_(innerHTML);
		} else {
			// childNodes
		}
		*/
		// console.log(node, instance);
		for (let i = 0; i < node.childNodes.length; i++) {
			const child = node.childNodes[i];
			if (child.nodeType === 1) {
				this.parse(child, instance);
			} else if (child.nodeType === 3) {
				const text = child.nodeValue;
				const replacedText = this.evaluate(text, instance);
				if (text !== replacedText) {
					// !!! save in var
					// node.setAttribute('innerHTML', text);
					const textNode = document.createTextNode(replacedText);
					node.replaceChild(textNode, child);
				}
			}
		}
	}

	resolve(expressionFunc, state, payload) {
		return expressionFunc.apply(state, [payload, this]);
	}

	makeInputs(meta, instance) {
		const inputs = {};
		if (meta.inputs) {
			meta.inputs.forEach((key, i) => inputs[key] = this.makeInput(instance, key));
		}
		return inputs;
	}

	makeOutputs(meta, instance) {
		const outputs = {};
		if (meta.outputs) {
			meta.outputs.forEach((key, i) => outputs[key] = this.makeOutput(instance, key));
		}
		return outputs;
	}

	resolveInputsOutputs(instance, state) {
		const context = Module.getContext(instance);
		const parentInstance = context.parentInstance;
		const inputs = context.inputs;
		Object.keys(inputs).forEach(key => {
			const inputFunction = inputs[key];
			const value = this.resolve(inputFunction, parentInstance, instance);
			instance[key] = value;
		});
		/*
		const outputs = context.outputs;
		Object.keys(outputs).forEach(key => {
			const inpuoutputFunctiontFunction = outputs[key];
			const value = this.resolve(outputFunction, parentInstance, null);
			// console.log(`setted -> ${key}`, value);
		});
		*/
	}

	getScope(node) {
		if (node === document) {
			return window;
		}
		const context = Module.getContextByNode(node);
		if (context) {
			return context.instance;
		}
	}

	getParentScope(node) {
		return Module.traverseUp(node, (node) => {
			return this.getScope(node);
		});
	}

	//

	optionalChaining(expression) {
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

	makeFunction(expression, params = ['$instance']) {
		if (!expression) {
			return () => { return null; };
		}
		const pipes = this.pipes;
		const transforms = Module.getPipesSegments(expression);
		expression = transforms.shift().trim();
		expression = this.optionalChaining(expression);
		// console.log('expression', "${expression}", ${params.join(',')}, this);
		// return expression_func;
		// console.log(pipes, transforms, expression);
		// console.log(transforms.length, params);
		params.push('module');
		// keyword 'this' represents state from func.apply(state, instance)
		if (transforms.length) {
			expression = transforms.reduce((expression, transform, i) => {
				const params = Module.getPipeParamsSegments(transform);
				const name = params.shift().trim();
				const pipe = pipes[name];
				if (!pipe || typeof pipe.transform !== 'function') {
					throw (`missing pipe ${name}`);
				}
				return `pipes.${name}.transform(${expression},${params.join(',')})`;
			}, expression);
			// console.log('expression', expression);
			const expression_func = new Function(`with(this) {
				return (function (${params.join(',')}) {
					const pipes = module.pipes;
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`);
			return expression_func;
		} else {
			// console.log('expression', expression);
			const expression_func = new Function(this.options.debug ? `with(this) {
				return (function (${params.join(',')}) {
					let value;
					try {
						value = ${expression};
					} catch(e) {
						console.error('${expression.replace(/\'/g,'"')}', this);
						value = e.message;
					}
					return value;
				}.bind(this)).apply(this, arguments);
			}` : `with(this) {
				return (function (${params.join(',')}) {
					return ${expression};
				}.bind(this)).apply(this, arguments);
			}`);
			return expression_func;
		}
	}

	makeInput(instance, name) {
		const context = Module.getContext(instance);
		const node = context.node;
		const expression = node.getAttribute(`[${name}]`);
		return this.makeFunction(expression);
	}

	makeOutput(instance, name) {
		const context = Module.getContext(instance);
		const node = context.node;
		const parentInstance = context.parentInstance;
		const expression = node.getAttribute(`(${name})`);
		const outputFunction = this.makeFunction(expression, ['$event']);
		const output$ = new Subject().pipe(
			tap((event) => {
				this.resolve(outputFunction, parentInstance, event);
			})
		);
		output$.pipe(
			takeUntil(instance.unsubscribe$)
		).subscribe();
		instance[name] = output$;
		return outputFunction;
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

	static unwrapSelectors(factories) {
		const selectors = [];
		factories.forEach(factory => {
			factory.meta.selector.split(',').forEach(selector => {
				selector = selector.trim();
				if (selector.indexOf('.') === 0) {
					const className = selector.replace(/\./g, '');
					selectors.push((node) => {
						const match = node.classList.has(className);
						return match ? { node, factory, selector } : false;
					});
				} else if (selector.match(/\[(.+)\]/)) {
					const attribute = selector.substr(1, selector.length - 2);
					selectors.push((node) => {
						const match = node.hasAttribute(attribute);
						return match ? { node, factory, selector } : false;
					});
				} else {
					selectors.push((node) => {
						const match = node.nodeName.toLowerCase() === selector.toLowerCase();
						return match ? { node, factory, selector } : false;
					});
				}
			});
		});
		return selectors;
	}

	static matchSelectors(node, selectors, results) {
		selectors.forEach(selector => {
			const match = selector(node);
			if (match) {
				const factory = match.factory;
				if (factory.prototype instanceof Component && factory.meta.template) {
					node.innerHTML = factory.meta.template;
				}
				results.push(match);
			}
		});
		return results;
	}

	static querySelectorsAll(node, selectors, results) {
		if (node.nodeType === 1) {
			results = this.matchSelectors(node, selectors, results);
		}
		const childNodes = node.childNodes;
		if (childNodes) {
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

	static use$(options) {
		/*
		if (!options.factories) {
			options.factories = [
				ClassDirective,
				EventDirective,
				IfStructure,
				ForStructure,
				StyleDirective
			];
		}
		if (!options.pipes) {
			options.pipes = [
				JsonPipe
			];
		}
		*/
		return new Module(options).use$();
	}

	static getContext(instance) {
		return CONTEXTS[instance.rxcompId];
	}

	static makeContext(module, instance, parentInstance, node, factory, selector) {
		instance.rxcompId = ++ID;
		const context = { module, instance, parentInstance, node, factory, selector };
		const rxcompNodeId = node.dataset.rxcompId = (node.dataset.rxcompId || ++ID);
		const nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
		nodeContexts.push(context);
		return CONTEXTS[instance.rxcompId] = context;
	}

	static deleteContext(id) {
		const context = CONTEXTS[id];
		const nodeContexts = NODES[context.node.dataset.id];
		const index = nodeContexts.indexOf(context);
		if (index !== -1) {
			nodeContexts.splice(index, 1);
		}
		delete CONTEXTS[id];
	}

	static getContextByNode(node) {
		let context;
		const nodeContexts = NODES[node.dataset.rxcompId];
		if (nodeContexts) {
			context = nodeContexts.reduce((previous, current) => {
				if (current.node === node && current.factory.prototype instanceof Component) {
					if (previous && current.factory.prototype instanceof Context) {
						return previous;
					} else {
						return current;
					}
				} else {
					return previous;
				}
			}, null);
		}
		return context;
		/*
		const context = Object.keys(CONTEXTS).reduce((previous, id) => {
			const current = CONTEXTS[id];
			if (current.node === node && current.factory.prototype instanceof Component) {
				if (previous && current.factory.prototype instanceof Context) {
					return previous;
				} else {
					return current;
				}
			} else {
				return previous;
			}
		}, null);
			return context;
		*/
		/*
		let id = Object.keys(CONTEXTS).find(id => CONTEXTS[id].node === node && CONTEXTS[id].factory.prototype instanceof Component);
		if (id) {
			const context = CONTEXTS[id];
			return context;
		}
		*/
	}

}
