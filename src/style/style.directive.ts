import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class StyleDirective extends Directive {

	style: { [key: string]: string };
	// keys: { [key: string]: string } = {};

	/*
	onInit() {
		const { node } = getContext(this);
		node.getAttribute('style').split(';').forEach(key => {
			const splitted = key.split(':');
			key = splitted[0];
			if (key) {
				const value = splitted[1].trim();
				this.keys[key.trim()] = value;
			}
		});
		console.log(this.keys);
	}
	*/

	onChanges() {
		const { node } = getContext(this);
		const style = this.style;
		if (style) {
			for (let key in style) {
				const splitted: string[] = key.split('.');
				const propertyName = splitted.shift();
				const value = style[key] + (splitted.length ? splitted[0] : '');
				// console.log(propertyName, value, style, key, style[key]);
				node.style.setProperty(propertyName, value);
			}
		}
		// console.log('StyleDirective.onChanges', style);
	}

}

StyleDirective.meta = {
	selector: `[[style]]`,
	inputs: ['style']
};
