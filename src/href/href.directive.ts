import Directive from '../core/directive';
import { getContext } from '../core/factory';

export default class HrefDirective extends Directive {

	set href(href: string) {
		if (this.href_ !== href) {
			this.href_ = href;
			const { node } = getContext(this);
			href ? node.setAttribute('href', href) : node.removeAttribute('href');
		}
	}

	get href(): string {
		return this.href_;
	}

	/*
	onChanges() {
		const { node } = getContext(this);
		node.setAttribute('href', this.href || '');
	}
	*/

}

HrefDirective.meta = {
	selector: '[[href]]',
	inputs: ['href'],
};
