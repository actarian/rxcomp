import Directive from '../core/directive';
import { getContext } from '../core/factory';
export default class HrefDirective extends Directive {
    set href(href) {
        if (this.href_ !== href) {
            this.href_ = href;
            const { node } = getContext(this);
            href ? node.setAttribute('href', href) : node.removeAttribute('href');
        }
    }
    get href() {
        return this.href_;
    }
}
HrefDirective.meta = {
    selector: '[[href]]',
    inputs: ['href'],
};
