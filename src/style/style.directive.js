import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class StyleDirective extends Directive {

	onInit() {
		const context = getContext(this);
		const module = context.module;
		const node = context.node;
		const expression = node.getAttribute('[style]');
		this.styleFunction = module.makeFunction(expression);
		// console.log('StyleDirective.onInit', expression);
	}

	onChanges(changes) {
		const context = getContext(this);
		const module = context.module;
		const node = context.node;
		const style = module.resolve(this.styleFunction, changes, this);
		for (let key in style) {
			node.style.setProperty(key, style[key]);
		}
		// console.log('StyleDirective.onChanges', changes, style);
	}

}

StyleDirective.meta = {
	selector: `[[style]]`
};
