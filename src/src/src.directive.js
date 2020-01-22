import Directive from '../core/directive';
import { getContext } from '../module/module';

export default class SrcDirective extends Directive {

	onChanges(changes) {
		const { node } = getContext(this);
		node.setAttribute('src', this.src);
	}

}

SrcDirective.meta = {
	selector: '[[src]]',
	inputs: ['src'],
};
