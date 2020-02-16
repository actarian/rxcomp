import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class ClassDirective extends Directive {

	class: { [key: string]: string } | string;
	keys: string[] = [];

	onInit() {
		const { node } = getContext(this);
		node.classList.forEach(x => this.keys.push(x));
	}

	onChanges() {
		const { node } = getContext(this);
		let keys: string[];
		const object = this.class;
		if (typeof object === 'object') {
			keys = [];
			for (let key in object) {
				if (object[key]) {
					keys.push(key);
				}
			}
		} else if (typeof object === 'string') {
			keys = object.split(/\s+/);
		}
		keys = (keys || []).concat(this.keys);
		// console.log(keys);
		node.setAttribute('class', keys.join(' '));
		// console.log('ClassDirective.onChanges', keys);
	}

}

ClassDirective.meta = {
	selector: `[[class]]`,
	inputs: ['class']
};

/*
export default class ClassDirective extends Directive {

	classFunction: ExpressionFunction;
	keys: string[] = [];

	onInit() {
		const { module, node } = getContext(this);
		const expression = node.getAttribute('[class]');
		this.classFunction = module.makeFunction(expression);
		node.classList.forEach(x => this.keys.push(x));
		// console.log('ClassDirective.onInit', this.classList, expression);
	}

	onChanges(changes: Factory | Window) {
		const { module, node } = getContext(this);
		const object = module.resolve(this.classFunction, changes, this);
		let keys: string[];
		if (typeof object === 'object') {
			keys = [];
			for (let key in object) {
				if (object[key]) {
					keys.push(key);
				}
			}
		} else if (typeof object === 'string') {
			keys = object.split(' ');
		}
		keys = (keys || []).concat(this.keys);
		// console.log(keys);
		node.setAttribute('class', keys.join(' '));
		// console.log('ClassDirective.onChanges', keys);
	}

}

ClassDirective.meta = {
	selector: `[[class]]`,
	inputs: ['class']
};
*/
