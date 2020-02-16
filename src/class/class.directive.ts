import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class ClassDirective extends Directive {

	/*
	classFunction: ExpressionFunction;

	onInit() {
		const { module, node } = getContext(this);
		const expression = node.getAttribute('[class]');
		this.classFunction = module.makeFunction(expression);
		// console.log('ClassDirective.onInit', this.classList, expression);
	}

	onChanges(changes: Factory | Window) {
		const { module, node } = getContext(this);
		const classList = module.resolve(this.classFunction, changes, this);
		if (typeof classList === 'object') {
			for (let key in classList) {
				classList[key] ? node.classList.add(key) : node.classList.remove(key);
			}
		} else if (typeof classList === 'string') {
			node.setAttribute('class', classList);
		}
		// console.log('ClassDirective.onChanges', classList);
	}
	*/

	class: { [key: string]: string } | string;

	onChanges() {
		const { node } = getContext(this);
		const classList = this.class;
		if (typeof classList === 'object') {
			for (let key in classList) {
				classList[key] ? node.classList.add(key) : node.classList.remove(key);
			}
		} else if (typeof classList === 'string') {
			node.setAttribute('class', classList);
		}
		// console.log('ClassDirective.onChanges', classList);
	}

}

ClassDirective.meta = {
	selector: `[[class]]`,
	inputs: ['class']
};
