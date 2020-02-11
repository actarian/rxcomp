import Directive from '../core/directive';
import { ExpressionFunction } from '../core/factory';
import { getContext } from '../module/module';

export default class ClassDirective extends Directive {

	classFunction: ExpressionFunction;

	onInit() {
		const { module, node } = getContext(this);
		const expression = node.getAttribute('[class]');
		this.classFunction = module.makeFunction(expression);
		// console.log('ClassDirective.onInit', this.classList, expression);
	}

	onChanges(changes) {
		const { module, node } = getContext(this);
		const classList = module.resolve(this.classFunction, changes, this);
		for (let key in classList) {
			classList[key] ? node.classList.add(key) : node.classList.remove(key);
		}
		// console.log('ClassDirective.onChanges', classList);
	}

}

ClassDirective.meta = {
	selector: `[[class]]`,
};
