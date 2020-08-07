"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var platform_1 = tslib_1.__importStar(require("./platform"));
var Browser = /** @class */ (function (_super) {
    tslib_1.__extends(Browser, _super);
    function Browser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param moduleFactory
     * @description This method returns a Browser compiled module
     */
    Browser.bootstrap = function (moduleFactory) {
        var _a;
        if (!platform_1.isPlatformBrowser) {
            throw 'missing platform browser, window not found';
        }
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
        if (window.rxcomp_hydrate_) {
            var clonedNode = meta.node.cloneNode();
            clonedNode.innerHTML = meta.nodeInnerHTML = window.rxcomp_hydrate_.innerHTML;
            var instances = module.compile(clonedNode, window);
            module.instances = instances;
            var root = instances[0];
            // if (root instanceof module.meta.bootstrap) {
            root.pushChanges();
            (_a = meta.node.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(clonedNode, meta.node);
            // }
        }
        else {
            var instances = module.compile(meta.node, window);
            module.instances = instances;
            var root = instances[0];
            // if (root instanceof module.meta.bootstrap) {
            root.pushChanges();
            // }
        }
        return module;
    };
    return Browser;
}(platform_1.default));
exports.default = Browser;
