import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

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
	static meta: IFactoryMeta = {
		selector: '[[href]]',
		inputs: ['href'],
	};
}

