import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

export default class InnerHtmlDirective extends Directive {
	set innerHTML(innerHTML: string) {
		if (this.innerHTML_ !== innerHTML) {
			this.innerHTML_ = innerHTML;
			const { node } = getContext(this);
			node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
		}
	}
	get innerHTML(): string {
		return this.innerHTML_;
	}
	static meta: IFactoryMeta = {
		selector: `[innerHTML]`,
		inputs: ['innerHTML'],
	};
}
