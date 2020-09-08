import Directive from '../core/directive';
import { getContext } from '../core/factory';
export default class HrefTargetDirective extends Directive {
    set target(target) {
        if (this.target_ !== target) {
            this.target_ = target;
            const { node } = getContext(this);
            target ? node.setAttribute('target', target) : node.removeAttribute('target');
        }
    }
    get target() {
        return this.target_;
    }
}
HrefTargetDirective.meta = {
    selector: '[[target]]',
    inputs: ['target'],
};
