import Component from '../core/component';
import Directive from '../core/directive';
import Factory from '../core/factory';
import Pipe from '../core/pipe';
import Structure from '../core/structure';
import { FactoryList, IElement, IModuleMeta, ISelectorResult, MatchFunction, PipeList, PipeMap, SelectorFunction } from '../core/types';
import Module from '../module/module';

const ORDER: FactoryList = [Structure, Component, Directive];

export default class Platform {

	static bootstrap(moduleFactory: typeof Module): Module {
		const meta = this.resolveMeta(moduleFactory);
		// console.log(meta);
		const bootstrap = meta.bootstrap;
		if (!bootstrap) {
			throw ('missing bootstrap');
		}
		const node = meta.node = this.querySelector(bootstrap.meta.selector);
		if (!node) {
			throw (`missing node ${bootstrap.meta.selector}`);
		}
		meta.nodeInnerHTML = node.innerHTML;
		meta.pipes = this.resolvePipes(meta);
		const factories = meta.factories = this.resolveFactories(meta);
		this.sortFactories(factories);
		factories.unshift(bootstrap);
		meta.selectors = this.unwrapSelectors(factories);
		const module = new moduleFactory();
		module.meta = meta;
		const instances = module.compile(node, window);
		const root = instances[0];
		// if (root instanceof module.meta.bootstrap) {
		root.pushChanges();
		// }
		return module;
	}

	static isBrowser(): boolean {
		return Boolean(window);
	}

	// static isServer() {}

	protected static querySelector(selector: string): IElement | null {
		return document.querySelector(selector);
	}

	protected static resolveMeta(moduleFactory: typeof Module): IModuleMeta {
		const meta = Object.assign({ imports: [], declarations: [], pipes: [], exports: [] }, moduleFactory.meta);
		meta.imports = meta.imports.map(moduleFactory => this.resolveMeta(moduleFactory));
		return meta;
	}

	protected static resolvePipes(meta: IModuleMeta, exported?: boolean): PipeMap {
		// !!!
		const importedPipes: PipeMap[] = (meta.imports as IModuleMeta[]).map((importMeta: IModuleMeta) => this.resolvePipes(importMeta, true));
		const pipes: PipeMap = {};
		const pipeList: PipeList = (exported ? meta.exports : meta.declarations).filter((x: any) => x.prototype instanceof Pipe) as PipeList; // !!! any
		pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
		return Object.assign({}, ...importedPipes, pipes);
	}

	protected static resolveFactories(meta: IModuleMeta, exported?: boolean): FactoryList {
		const importedFactories: FactoryList[] = meta.imports.map((importMeta: any) => this.resolveFactories(importMeta, true)); // !!! any
		const factoryList: FactoryList = (exported ? meta.exports : meta.declarations).filter((x: any) => x.prototype instanceof Factory) as FactoryList;
		return Array.prototype.concat.call(factoryList, ...importedFactories);
	}

	protected static sortFactories(factories: FactoryList): void {
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

	protected static getExpressions(selector: string): MatchFunction[] {
		let matchers: ((node: HTMLElement) => boolean)[] = [];
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

	protected static unwrapSelectors(factories: FactoryList): SelectorFunction[] {
		const selectors: SelectorFunction[] = [];
		factories.forEach((factory: typeof Factory) => {
			factory.meta.selector.split(',').forEach((selector: string) => {
				selector = selector.trim();
				let excludes: MatchFunction[] = [];
				const matchSelector = selector.replace(/\:not\((.+?)\)/g, (value, unmatchSelector) => {
					excludes = this.getExpressions(unmatchSelector);
					return '';
				});
				const includes: MatchFunction[] = this.getExpressions(matchSelector);
				selectors.push((node) => {
					const included = includes.reduce((p, match) => {
						return p && match(node);
					}, true);
					const excluded = excludes.reduce((p, match) => {
						return p || match(node);
					}, false);
					if (included && !excluded) {
						return { node, factory, selector } as ISelectorResult;
					} else {
						return false;
					}
				});
			});
		});
		return selectors;
	}

}
