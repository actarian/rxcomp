import { IElement, IModuleParsedMeta } from '../core/types';
import Module from '../module/module';
import Platform, { isPlatformBrowser } from './platform';

export default class Browser extends Platform {

	/**
	 * @param moduleFactory
	 * @description This method returns a Browser compiled module
	 */
	static bootstrap(moduleFactory?: typeof Module): Module {
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
		const meta: IModuleParsedMeta = this.resolveMeta(moduleFactory!);
		const module: Module = new moduleFactory();
		module.meta = meta;
		if (window.rxcomp_hydrate_) {
			const clonedNode = meta.node.cloneNode() as IElement;
			clonedNode.innerHTML = meta.nodeInnerHTML = window.rxcomp_hydrate_.innerHTML;
			const instances = module.compile(clonedNode, window);
			module.instances = instances;
			const root = instances[0];
			// if (root instanceof module.meta.bootstrap) {
			root.pushChanges();
			meta.node.parentNode?.replaceChild(clonedNode, meta.node);
			// }
		} else {
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
