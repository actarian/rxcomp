// import Factory, { ExpressionFunction } from '../core/factory';
import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class ClassDirective extends Directive {

	class: { [key: string]: string } | string | null;
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
