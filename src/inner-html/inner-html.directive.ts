import Directive from '../core/directive';
import { getContext } from '../core/factory';

export default class InnerHtmlDirective extends Directive {

	innerHTML?: string;

	onChanges() {
		const { node } = getContext(this);
		node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML; // !!! keep == loose equality
	}

}

InnerHtmlDirective.meta = {
	selector: `[innerHTML]`,
	inputs: ['innerHTML'],
};
