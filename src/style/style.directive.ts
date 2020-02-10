import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class StyleDirective extends Directive {
	styleFunction: Function;

	onInit() {
		const { module, node } = getContext(this);
		const expression = node.getAttribute('[style]');
		this.styleFunction = module.makeFunction(expression);
		// console.log('StyleDirective.onInit', expression);
	}

	onChanges(changes) {
		const { module, node } = getContext(this);
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
