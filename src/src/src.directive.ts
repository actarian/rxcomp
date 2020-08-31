import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

export default class SrcDirective extends Directive {
	set src(src: string) {
		if (this.src_ !== src) {
			this.src_ = src;
			const { node } = getContext(this);
			src ? node.setAttribute('src', src) : node.removeAttribute('src');
		}
	}
	get src(): string {
		return this.src_;
	}
	static meta: IFactoryMeta = {
		selector: '[[src]]',
		inputs: ['src'],
	};
}
