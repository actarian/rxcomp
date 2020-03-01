import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class SrcDirective extends Directive {

	src?: string;

	onChanges() {
		const { node } = getContext(this);
		if (this.src) {
			node.setAttribute('src', this.src);
		} else {
			node.removeAttribute('src');
		}
	}

}

SrcDirective.meta = {
	selector: '[[src]]',
	inputs: ['src'],
};
