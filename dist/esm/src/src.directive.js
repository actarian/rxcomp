import Directive from '../core/directive';
import { getContext } from '../core/factory';
export default class SrcDirective extends Directive {
    onChanges() {
        const { node } = getContext(this);
        if (this.src) {
            node.setAttribute('src', this.src);
        }
        else {
            node.removeAttribute('src');
        }
    }
}
SrcDirective.meta = {
    selector: '[[src]]',
    inputs: ['src'],
};
