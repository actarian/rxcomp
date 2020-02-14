import Directive from '../core/directive';
import { getContext } from '../module/module';
export default class InnerHtmlDirective extends Directive {
    onChanges(changes) {
        const { node } = getContext(this);
        node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML;
    }
}
InnerHtmlDirective.meta = {
    selector: `[innerHTML]`,
    inputs: ['innerHTML'],
};
//# sourceMappingURL=inner-html.directive.js.map