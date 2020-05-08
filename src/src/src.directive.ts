import Directive from '../core/directive';
import { getContext } from '../core/factory';

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

	/*
	onChanges() {
		const { node } = getContext(this);
		if (this.src) {
			if (node.getAttribute('src') !== this.src) {
				node.setAttribute('src', this.src);
			}
		} else {
			node.removeAttribute('src');
		}
	}
	*/

}

SrcDirective.meta = {
	selector: '[[src]]',
	inputs: ['src'],
};
