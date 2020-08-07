import Platform, { isPlatformBrowser } from './platform';
export default class Browser extends Platform {
    /**
     * @param moduleFactory
     * @description This method returns a Browser compiled module
     */
    static bootstrap(moduleFactory) {
        var _a;
        if (!isPlatformBrowser) {
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
        const meta = this.resolveMeta(moduleFactory);
        const module = new moduleFactory();
        module.meta = meta;
        if (window.rxcomp_hydrate_) {
            const clonedNode = meta.node.cloneNode();
            clonedNode.innerHTML = meta.nodeInnerHTML = window.rxcomp_hydrate_.innerHTML;
            const instances = module.compile(clonedNode, window);
            module.instances = instances;
            const root = instances[0];
            // if (root instanceof module.meta.bootstrap) {
            root.pushChanges();
            (_a = meta.node.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(clonedNode, meta.node);
            // }
        }
        else {
            const instances = module.compile(meta.node, window);
            module.instances = instances;
            const root = instances[0];
            // if (root instanceof module.meta.bootstrap) {
            root.pushChanges();
            // }
        }
        return module;
    }
}
