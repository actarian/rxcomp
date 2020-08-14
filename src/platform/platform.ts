import Component from '../core/component';
import Directive from '../core/directive';
import Factory from '../core/factory';
import Pipe from '../core/pipe';
import Structure from '../core/structure';
import { FactoryList, IElement, IModuleParsedImportedMeta, IModuleParsedMeta, ISelectorResult, MatchFunction, PipeList, PipeMap, SelectorFunction } from '../core/types';
import { ModuleError } from '../error/error';
import Module from '../module/module';

const ORDER: FactoryList = [Structure, Component, Directive];

export default class Platform {

	/**
	 * @param moduleFactory
	 * @description This method returns an uncompiled module
	 */
	static bootstrap(moduleFactory?: typeof Module): Module {
		if (!moduleFactory) {
			throw new ModuleError('missing moduleFactory');
		}
		if (!moduleFactory.meta) {
			throw new ModuleError('missing moduleFactory meta');
		}
		if (!moduleFactory.meta.bootstrap) {
			throw new ModuleError('missing bootstrap');
		}
		if (!moduleFactory.meta.bootstrap.meta) {
			throw new ModuleError('missing bootstrap meta');
		}
		if (!moduleFactory.meta.bootstrap.meta.selector) {
			throw new ModuleError('missing bootstrap meta selector');
		}
		const meta: IModuleParsedMeta = this.resolveMeta(moduleFactory!);
		const module: Module = new moduleFactory();
		module.meta = meta;
		meta.imports.forEach((moduleFactory: typeof Module) => {
			moduleFactory.prototype.constructor.call(module);
		});
		// const instances = module.compile(meta.node, window);
		// module.instances = instances;
		// const root = instances[0];
		// root.pushChanges();
		return module;
	}

	protected static querySelector(selector: string): IElement | null {
		return document.querySelector(selector);
	}

	protected static resolveMeta(moduleFactory: typeof Module): IModuleParsedMeta {
		const meta: IModuleParsedImportedMeta = this.resolveImportedMeta(moduleFactory);
		const bootstrap: typeof Factory = moduleFactory.meta.bootstrap!;
		const node = this.querySelector(bootstrap.meta.selector!);
		if (!node) {
			throw new ModuleError(`missing node ${bootstrap.meta.selector}`);
		}
		const nodeInnerHTML = node.innerHTML;
		const pipes = this.resolvePipes(meta);
		const factories = this.resolveFactories(meta);
		this.sortFactories(factories);
		factories.unshift(bootstrap);
		const selectors = this.unwrapSelectors(factories);
		return { factories, pipes, selectors, bootstrap, node, nodeInnerHTML, imports: moduleFactory.meta.imports || [] };
	}

	protected static resolveImportedMeta(moduleFactory: typeof Module): IModuleParsedImportedMeta {
		const meta: IModuleParsedImportedMeta = Object.assign({
			imports: [],
			declarations: [],
			pipes: [],
			exports: []
		}, moduleFactory.meta);
		meta.imports = (moduleFactory.meta.imports || []).map(moduleFactory => this.resolveImportedMeta(moduleFactory));
		return meta;
	}

	protected static resolvePipes(meta: IModuleParsedImportedMeta, exported?: boolean): PipeMap {
		const importedPipes: PipeMap[] = meta.imports.map((importMeta: IModuleParsedImportedMeta) => this.resolvePipes(importMeta, true));
		const pipes: PipeMap = {};
		const pipeList: PipeList = (exported ? meta.exports : meta.declarations).filter((x): x is typeof Pipe => x.prototype instanceof Pipe);
		pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
		return Object.assign({}, ...importedPipes, pipes);
	}

	protected static resolveFactories(meta: IModuleParsedImportedMeta, exported?: boolean): FactoryList {
		const importedFactories: FactoryList[] = meta.imports.map((importMeta: any) => this.resolveFactories(importMeta, true));
		const factoryList: FactoryList = (exported ? meta.exports : meta.declarations).filter((x): x is typeof Factory => x.prototype instanceof Factory);
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
			if (factory.meta && factory.meta.selector) {
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
			}
		});
		return selectors;
	}

}

/* global window self */
export const PLATFORM_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/* eslint-disable no-undef */
export const PLATFORM_JS_DOM = (typeof window !== 'undefined' && window.name === 'nodejs') || (typeof navigator !== 'undefined' && navigator.userAgent.includes('Node.js')) || (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom'));
/* eslint-enable no-undef */

export const PLATFORM_NODE = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/* eslint-disable no-restricted-globals */
export const PLATFORM_WEB_WORKER = typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';

export const isPlatformServer = PLATFORM_NODE;
export const isPlatformBrowser = !PLATFORM_NODE && PLATFORM_BROWSER;
export const isPlatformWorker = PLATFORM_WEB_WORKER;
