import Directive from '../core/directive';
import { getContext } from '../module/module';
export default class StyleDirective extends Directive {
    onInit() {
        const { module, node } = getContext(this);
        const expression = node.getAttribute('[style]');
        this.styleFunction = module.makeFunction(expression);
    }
    onChanges(changes) {
        const { module, node } = getContext(this);
        const style = module.resolve(this.styleFunction, changes, this);
        for (let key in style) {
            node.style.setProperty(key, style[key]);
        }
    }
}
StyleDirective.meta = {
    selector: `[[style]]`
};
//# sourceMappingURL=style.directive.js.map