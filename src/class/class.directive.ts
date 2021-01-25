import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

export default class ClassDirective extends Directive {
	class: { [key: string]: string } | string | null = '';
	keys: string[] = [];
	onInit() {
		const { node } = getContext(this);
		Array.prototype.slice.call(node.classList).forEach((value: string) => {
			this.keys.push(value);
		});
		// console.log('ClassDirective.onInit');
	}
	onChanges() {
		const { node } = getContext(this);
		let keys: string[] = [];
		const object = this.class;
		if (typeof object === 'object') {
			for (let key in object) {
				if (object[key]) {
					keys.push(key);
				}
			}
		} else if (typeof object === 'string') {
			keys = object.split(/\s+/);
		}
		keys = keys.concat(this.keys);
		// console.log(keys);
		node.setAttribute('class', keys.join(' '));
		// console.log('ClassDirective.onChanges', keys);
	}
	static meta: IFactoryMeta = {
		selector: `[[class]]`,
		inputs: ['class']
	};
}
