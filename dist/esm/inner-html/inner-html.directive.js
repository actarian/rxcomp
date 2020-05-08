import Directive from '../core/directive';
import { getContext } from '../core/factory';
export default class InnerHtmlDirective extends Directive {
    set innerHTML(innerHTML) {
        if (this.innerHTML_ !== innerHTML) {
            this.innerHTML_ = innerHTML;
            const { node } = getContext(this);
            node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
        }
    }
    get innerHTML() {
        return this.innerHTML_;
    }
}
InnerHtmlDirective.meta = {
    selector: `[innerHTML]`,
    inputs: ['innerHTML'],
};
