import Component from '../core/component';
import Directive from '../core/directive';
import Factory, { SelectorFunction } from '../core/factory';
import Pipe from '../core/pipe';
import Structure from '../core/structure';
import Module, { IModuleMeta } from '../module/module';

const ORDER = [Structure, Component, Directive];

export default class Platform {

	static bootstrap(moduleFactory: typeof Module): Module {
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

	static querySelector(selector: string): HTMLElement | null {
		return document.querySelector(selector);
	}

	static resolveMeta(moduleFactory: typeof Module): IModuleMeta {
		const meta = Object.assign({ imports: [], declarations: [], pipes: [], exports: [] }, moduleFactory.meta);
		meta.imports = meta.imports.map(moduleFactory => this.resolveMeta(moduleFactory));
		return meta;
	}

	static resolvePipes(meta: IModuleMeta, exported?: boolean) {
		const importedPipes = meta.imports.map((moduleFactory: typeof Module) => this.resolvePipes(moduleFactory.meta, true));
		const pipes = {};
		const pipeList: typeof Pipe[] = (exported ? meta.exports : meta.declarations).filter(x => x.prototype instanceof Pipe);
		pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
		return Object.assign({}, ...importedPipes, pipes);
	}

	static resolveFactories(meta, exported?: boolean): typeof Factory[] {
		const importedFactories = meta.imports.map(meta => this.resolveFactories(meta, true));
		const factoryList = (exported ? meta.exports : meta.declarations).filter(x => (x.prototype instanceof Structure || x.prototype instanceof Component || x.prototype instanceof Directive));
		return Array.prototype.concat.call(factoryList, ...importedFactories);
	}

	static sortFactories(factories: typeof Factory[]): void {
		factories.sort((a, b) => {
			const ai = ORDER.reduce((p, c, i) => a.prototype instanceof c ? i : p, -1);
			const bi = ORDER.reduce((p, c, i) => b.prototype instanceof c ? i : p, -1);
			// return ai - bi;
			const o = ai - bi;
			if (o === 0) {
				return (a.meta.hosts ? 1 : 0) - (b.meta.hosts ? 1 : 0);
			}
			return o;
		});
	}

	static getExpressions(selector: string): Function[] {
		let matchers = [];
		selector.replace(/\.([\w\-\_]+)|\[(.+?\]*)(\=)(.*?)\]|\[(.+?\]*)\]|([\w\-\_]+)/g, function (value: string, c1, a2, u3, v4, a5, e6) {
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

	static unwrapSelectors(factories: typeof Factory[]): SelectorFunction[] {
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
					} else {
						return false;
					}
				});
			});
		});
		return selectors;
	}

	static isBrowser(): boolean {
		return Boolean(window);
	}

	// static isServer() {}

}
