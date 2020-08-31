import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

export default class HrefTargetDirective extends Directive {
	set target(target: string) {
		if (this.target_ !== target) {
			this.target_ = target;
			const { node } = getContext(this);
			target ? node.setAttribute('target', target) : node.removeAttribute('target');
		}
	}
	get target(): string {
		return this.target_;
	}
	static meta: IFactoryMeta = {
		selector: '[[target]]',
		inputs: ['target'],
	};
}
