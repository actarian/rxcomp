import Component from '../core/component';
import Directive from '../core/directive';
import Pipe from '../core/pipe';
import Structure from '../core/structure';

const ORDER = [Structure, Component, Directive];

export default class Platform {

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
		// if (root instanceof module.meta.bootstrap) {
		root.pushChanges();
		// }
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
		const importedPipes = meta.imports.map(meta => this.resolvePipes(meta, true));
		const pipes = {};
		const pipeList = (exported ? meta.exports : meta.declarations).filter(x => x.prototype instanceof Pipe);
		pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
		return Object.assign({}, ...importedPipes, pipes);
	}

	static resolveFactories(meta, exported) {
		const importedFactories = meta.imports.map(meta => this.resolveFactories(meta, true));
		const factoryList = (exported ? meta.exports : meta.declarations).filter(x => (x.prototype instanceof Structure || x.prototype instanceof Component || x.prototype instanceof Directive));
		return Array.prototype.concat.call(factoryList, ...importedFactories);
	}

	static sortFactories(factories) {
		factories.sort((a, b) => {
			const ai = ORDER.reduce((p, c, i) => a.prototype instanceof c ? i : p, -1);
			const bi = ORDER.reduce((p, c, i) => b.prototype instanceof c ? i : p, -1);
			return ai - bi;
		});
	}

	static unwrapSelectors(factories) {
		const selectors = [];
		factories.forEach(factory => {
			factory.meta.selector.split(',').forEach(selector => {
				selector = selector.trim();
				// (\:not\((\.[\w\-\_]+)|(\[.+?\])|([\w\-\_]+)\))|(\.[\w\-\_]+)|(\[.+?\])|([\w\-\_]+);
				let matchers = [];
				selector.replace(/(\.[\w\-\_]+)|(\[+.+?\]+)|([\w\-\_]+)/g, function(value, className, attrName, nodeName) {
					if (className) {
						matchers.push(function(node) {
							return node.classList.contains(className.replace(/\./g, ''));
						});
					}
					if (attrName) {
						matchers.push(function(node) {
							return node.hasAttribute(attrName.substr(1, attrName.length - 2));
						});
					}
					if (nodeName) {
						matchers.push(function(node) {
							return node.nodeName.toLowerCase() === nodeName.toLowerCase();
						});
					}
				});
				selectors.push(function(node) {
					const match = matchers.reduce((match, matcher) => {
						return match && matcher(node);
					}, true);
					return match ? { node, factory, selector } : false;
				});
			});
		});
		return selectors;
	}

	/*
	static unwrapSelectors(factories) {
		const selectors = [];
		factories.forEach(factory => {
			factory.meta.selector.split(',').forEach(selector => {
				selector = selector.trim();
				if (selector.indexOf('.') === 0) {
					const className = selector.replace(/\./g, '');
					selectors.push((node) => {
						const match = node.classList.contains(className);
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
	*/

	static isBrowser() {
		return window;
	}

	// static isServer() {}

}
