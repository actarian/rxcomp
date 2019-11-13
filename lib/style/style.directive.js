import Directive from '../directive/directive';
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

	onState(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const style = module.resolve(this.styleFunction, state, this);
		Object.keys(style).forEach(key => {
			node.style[key] = style[key];
		});
		// console.log('StyleDirective.onState', state, style);
	}

}

StyleDirective.meta = {
	selector: `[[style]]`
};
