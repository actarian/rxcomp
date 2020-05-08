"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var component_1 = tslib_1.__importDefault(require("../core/component"));
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = tslib_1.__importDefault(require("../core/factory"));
var pipe_1 = tslib_1.__importDefault(require("../core/pipe"));
var structure_1 = tslib_1.__importDefault(require("../core/structure"));
var ORDER = [structure_1.default, component_1.default, directive_1.default];
var Platform = /** @class */ (function () {
    function Platform() {
    }
    Platform.bootstrap = function (moduleFactory) {
        if (!moduleFactory) {
            throw ('missing moduleFactory');
        }
        if (!moduleFactory.meta) {
            throw ('missing moduleFactory meta');
        }
        if (!moduleFactory.meta.bootstrap) {
            throw ('missing bootstrap');
        }
        if (!moduleFactory.meta.bootstrap.meta) {
            throw ('missing bootstrap meta');
        }
        if (!moduleFactory.meta.bootstrap.meta.selector) {
            throw ('missing bootstrap meta selector');
        }
        var meta = this.resolveMeta(moduleFactory);
        var module = new moduleFactory();
        module.meta = meta;
        var instances = module.compile(meta.node, window);
        var root = instances[0];
        // if (root instanceof module.meta.bootstrap) {
        root.pushChanges();
        // }
        return module;
    };
    Platform.isBrowser = function () {
        return Boolean(window);
    };
    // static isServer() {}
    Platform.querySelector = function (selector) {
        return document.querySelector(selector);
    };
    Platform.resolveMeta = function (moduleFactory) {
        var meta = this.resolveImportedMeta(moduleFactory);
        var bootstrap = moduleFactory.meta.bootstrap;
        var node = this.querySelector(bootstrap.meta.selector);
        if (!node) {
            throw ("missing node " + bootstrap.meta.selector);
        }
        var nodeInnerHTML = node.innerHTML;
        var pipes = this.resolvePipes(meta);
        var factories = this.resolveFactories(meta);
        this.sortFactories(factories);
        factories.unshift(bootstrap);
        var selectors = this.unwrapSelectors(factories);
        return { factories: factories, pipes: pipes, selectors: selectors, bootstrap: bootstrap, node: node, nodeInnerHTML: nodeInnerHTML };
    };
    Platform.resolveImportedMeta = function (moduleFactory) {
        var _this = this;
        var meta = Object.assign({
            imports: [],
            declarations: [],
            pipes: [],
            exports: []
        }, moduleFactory.meta);
        meta.imports = (moduleFactory.meta.imports || []).map(function (moduleFactory) { return _this.resolveImportedMeta(moduleFactory); });
        return meta;
    };
    Platform.resolvePipes = function (meta, exported) {
        var _this = this;
        var importedPipes = meta.imports.map(function (importMeta) { return _this.resolvePipes(importMeta, true); });
        var pipes = {};
        var pipeList = (exported ? meta.exports : meta.declarations).filter(function (x) { return x.prototype instanceof pipe_1.default; });
        pipeList.forEach(function (pipeFactory) { return pipes[pipeFactory.meta.name] = pipeFactory; });
        return Object.assign.apply(Object, tslib_1.__spreadArrays([{}], importedPipes, [pipes]));
    };
    Platform.resolveFactories = function (meta, exported) {
        var _a;
        var _this = this;
        var importedFactories = meta.imports.map(function (importMeta) { return _this.resolveFactories(importMeta, true); });
        var factoryList = (exported ? meta.exports : meta.declarations).filter(function (x) { return x.prototype instanceof factory_1.default; });
        return (_a = Array.prototype.concat).call.apply(_a, tslib_1.__spreadArrays([factoryList], importedFactories));
    };
    Platform.sortFactories = function (factories) {
        factories.sort(function (a, b) {
            var ai = ORDER.reduce(function (p, c, i) { return a.prototype instanceof c ? i : p; }, -1);
            var bi = ORDER.reduce(function (p, c, i) { return b.prototype instanceof c ? i : p; }, -1);
            // return ai - bi;
            var o = ai - bi;
            if (o === 0) {
                return (a.meta.hosts ? 1 : 0) - (b.meta.hosts ? 1 : 0);
            }
            return o;
        });
    };
    Platform.getExpressions = function (selector) {
        var matchers = [];
        selector.replace(/\.([\w\-\_]+)|\[(.+?\]*)(\=)(.*?)\]|\[(.+?\]*)\]|([\w\-\_]+)/g, function (value, c1, a2, u3, v4, a5, e6) {
            if (c1) {
                matchers.push(function (node) {
                    return node.classList.contains(c1);
                });
            }
            if (a2) {
                matchers.push(function (node) {
                    return (node.hasAttribute(a2) && node.getAttribute(a2) === v4) ||
                        (node.hasAttribute("[" + a2 + "]") && node.getAttribute("[" + a2 + "]") === v4);
                });
            }
            if (a5) {
                matchers.push(function (node) {
                    return node.hasAttribute(a5) || node.hasAttribute("[" + a5 + "]");
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
    };
    Platform.unwrapSelectors = function (factories) {
        var _this = this;
        var selectors = [];
        factories.forEach(function (factory) {
            if (factory.meta && factory.meta.selector) {
                factory.meta.selector.split(',').forEach(function (selector) {
                    selector = selector.trim();
                    var excludes = [];
                    var matchSelector = selector.replace(/\:not\((.+?)\)/g, function (value, unmatchSelector) {
                        excludes = _this.getExpressions(unmatchSelector);
                        return '';
                    });
                    var includes = _this.getExpressions(matchSelector);
                    selectors.push(function (node) {
                        var included = includes.reduce(function (p, match) {
                            return p && match(node);
                        }, true);
                        var excluded = excludes.reduce(function (p, match) {
                            return p || match(node);
                        }, false);
                        if (included && !excluded) {
                            return { node: node, factory: factory, selector: selector };
                        }
                        else {
                            return false;
                        }
                    });
                });
            }
        });
        return selectors;
    };
    return Platform;
}());
exports.default = Platform;