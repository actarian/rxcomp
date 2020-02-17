import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class StyleDirective extends Directive {

	/*
	styleFunction: ExpressionFunction;

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
	*/

	style: { [key: string]: string };

	onChanges() {
		const { node } = getContext(this);
		const style = this.style;
		if (style) {
			for (let key in style) {
				const splitted: string[] = key.split('.');
				const name = splitted.shift();
				node.style.setProperty(name, style[key] + splitted.length ? splitted[0] : '');
			}
		}
		console.log('StyleDirective.onChanges', style);
	}

}

StyleDirective.meta = {
	selector: `[[style]]`,
	inputs: ['style']
};
