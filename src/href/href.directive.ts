import Directive from '../core/directive';
import { getContext } from '../core/factory';

export default class HrefDirective extends Directive {

	href?: string;

	onChanges() {
		const { node } = getContext(this);
		node.setAttribute('href', this.href || '');
	}

}

HrefDirective.meta = {
	selector: '[[href]]',
	inputs: ['href'],
};
