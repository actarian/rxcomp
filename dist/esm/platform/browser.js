import { ModuleError } from '../error/error';
import { WINDOW } from './common/window/window';
import Platform, { isPlatformBrowser } from './platform';
export default class Browser extends Platform {
    /**
     * @param moduleFactory
     * @description This method returns a Browser compiled module
     */
    static bootstrap(moduleFactory) {
        var _a;
        if (!isPlatformBrowser) {
            throw new ModuleError('missing platform browser, Window not found');
        }
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
        if (WINDOW.rxcomp_hydrate_) {
            const clonedNode = meta.node.cloneNode();
            clonedNode.innerHTML = meta.nodeInnerHTML = WINDOW.rxcomp_hydrate_.innerHTML;
            const instances = module.compile(clonedNode, WINDOW);
            module.instances = instances;
            /*
            const root = instances[0];
            root.pushChanges();
            */
            (_a = meta.node.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(clonedNode, meta.node);
        }
        else {
            const instances = module.compile(meta.node, WINDOW);
            module.instances = instances;
            /*
            const root = instances[0];
            root.pushChanges();
            */
        }
        return module;
    }
}
