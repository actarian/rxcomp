import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

export default class StyleDirective extends Directive {
	style?: { [key: string]: string } | null;
	previousStyle?: { [key: string]: string } | null;
	onChanges() {
		const { node } = getContext(this);
		const style = this.style;
		const previousStyle = this.previousStyle;
		if (previousStyle) {
			for (let key in previousStyle) {
				if (!style || !style[key]) {
					const splitted: string[] = key.split('.');
					const propertyName = splitted.shift();
					node.style.removeProperty(propertyName!);
				}
			}
		}
		if (style) {
			for (let key in style) {
				if (!previousStyle || previousStyle[key] !== style[key]) {
					const splitted: string[] = key.split('.');
					const propertyName = splitted.shift();
					const value = style[key] + (splitted.length ? splitted[0] : '');
					// console.log(propertyName, value, style, key, style[key]);
					node.style.setProperty(propertyName!, value);
				}
			}
		}
		this.previousStyle = style;
		// console.log('StyleDirective.onChanges', style);
	}
	static meta: IFactoryMeta = {
		selector: `[[style]]`,
		inputs: ['style']
	};
}
