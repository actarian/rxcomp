import Directive from '../core/directive';
import Module from '../module/module';

export default class StyleDirective extends Directive {

	onInit() {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const expression = node.getAttribute('[style]');
		this.styleFunction = module.makeFunction(expression);
		// console.log('StyleDirective.onInit', expression);
	}

	onChanges(changes) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const style = module.resolve(this.styleFunction, changes, this);
		Object.keys(style).forEach(key => {
			node.style[key] = style[key];
		});
		// console.log('StyleDirective.onChanges', changes, style);
	}

}

StyleDirective.meta = {
	selector: `[[style]]`
};
