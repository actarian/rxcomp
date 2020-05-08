import Directive from '../core/directive';
import { getContext } from '../core/factory';
export default class SrcDirective extends Directive {
    set src(src) {
        if (this.src_ !== src) {
            this.src_ = src;
            const { node } = getContext(this);
            src ? node.setAttribute('src', src) : node.removeAttribute('src');
        }
    }
    get src() {
        return this.src_;
    }
}
SrcDirective.meta = {
    selector: '[[src]]',
    inputs: ['src'],
};
