import Component from '../core/component';
import Directive from '../core/directive';
import Factory from '../core/factory';
import Pipe from '../core/pipe';
import Structure from '../core/structure';
import { ModuleError } from '../error/error';
const ORDER = [Structure, Component, Directive];
export default class Platform {
    /**
     * @param moduleFactory
     * @description This method returns an uncompiled module
     */
    static bootstrap(moduleFactory) {
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
        const meta = this.resolveMeta(moduleFactory);
        const module = new moduleFactory();
        module.meta = meta;
        meta.imports.forEach((moduleFactory) => {
            moduleFactory.prototype.constructor.call(module);
        });
        return module;
    }
    static querySelector(selector) {
        return document.querySelector(selector);
    }
    static resolveMeta(moduleFactory) {
        const meta = this.resolveImportedMeta(moduleFactory);
        const bootstrap = moduleFactory.meta.bootstrap;
        const node = this.querySelector(bootstrap.meta.selector);
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
    static resolveImportedMeta(moduleFactory) {
        const meta = Object.assign({
            imports: [],
            declarations: [],
            pipes: [],
            exports: []
        }, moduleFactory.meta);
        meta.imports = (moduleFactory.meta.imports || []).map(moduleFactory => this.resolveImportedMeta(moduleFactory));
        return meta;
    }
    static resolvePipes(meta, exported) {
        const importedPipes = meta.imports.map((importMeta) => this.resolvePipes(importMeta, true));
        const pipes = {};
        const pipeList = (exported ? meta.exports : meta.declarations).filter((x) => x.prototype instanceof Pipe);
        pipeList.forEach(pipeFactory => pipes[pipeFactory.meta.name] = pipeFactory);
        return Object.assign({}, ...importedPipes, pipes);
    }
    static resolveFactories(meta, exported) {
        const importedFactories = meta.imports.map((importMeta) => this.resolveFactories(importMeta, true));
        const factoryList = (exported ? meta.exports : meta.declarations).filter((x) => x.prototype instanceof Factory);
        return Array.prototype.concat.call(factoryList, ...importedFactories);
    }
    static sortFactories(factories) {
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
    static getExpressions(selector) {
        let matchers = [];
        selector.replace(/\.([\w\-\_]+)|\[(.+?\]*)(\=)(.*?)\]|\[(.+?\]*)\]|([\w\-\_]+)/g, function (value, c1, a2, u3, v4, a5, e6) {
            if (c1) {
                // className
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
                // attribute
                matchers.push(function (node) {
                    return node.hasAttribute(a5) || node.hasAttribute(`[${a5}]`);
                });
            }
            if (e6) {
                // nodeName
                matchers.push(function (node) {
                    return node.nodeName.toLowerCase() === e6.toLowerCase();
                });
            }
            return '';
        });
        return matchers;
    }
    static unwrapSelectors(factories) {
        const selectors = [];
        factories.forEach((factory) => {
            if (factory.meta && factory.meta.selector) {
                factory.meta.selector.split(',').forEach((selector) => {
                    selector = selector.trim();
                    let excludes = [];
                    const matchSelector = selector.replace(/\:not\((.+?)\)/g, (value, unmatchSelector) => {
                        excludes = this.getExpressions(unmatchSelector);
                        return '';
                    });
                    const includes = this.getExpressions(matchSelector);
                    selectors.push(function (node) {
                        const included = includes.reduce(function (p, match) {
                            return p && match(node);
                        }, true);
                        if (included) {
                            const excluded = excludes.length && excludes.reduce(function (p, match) {
                                return p || match(node);
                            }, false);
                            if (!excluded) {
                                return { node, factory, selector };
                            }
                            else {
                                return false;
                            }
                        }
                        else {
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
export const PLATFORM_JS_DOM = (typeof window !== 'undefined' && window.name === 'nodejs') || (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Node.js') !== -1) || (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('jsdom') !== -1);
/* eslint-enable no-undef */
export const PLATFORM_NODE = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
/* eslint-disable no-restricted-globals */
export const PLATFORM_WEB_WORKER = typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';
export const isPlatformServer = PLATFORM_NODE;
export const isPlatformBrowser = !PLATFORM_NODE && PLATFORM_BROWSER;
export const isPlatformWorker = PLATFORM_WEB_WORKER;
