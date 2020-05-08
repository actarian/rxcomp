import Directive from '../core/directive';
import { getContext } from '../core/factory';

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

	/*
	onChanges() {
		const { node } = getContext(this);
		node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML; // !!! keep == loose equality
	}
	*/

}

InnerHtmlDirective.meta = {
	selector: `[innerHTML]`,
	inputs: ['innerHTML'],
};
