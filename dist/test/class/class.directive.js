import Directive from '../core/directive';
import { getContext } from '../module/module';
export default class ClassDirective extends Directive {
    onInit() {
        const { module, node } = getContext(this);
        const expression = node.getAttribute('[class]');
        this.classFunction = module.makeFunction(expression);
    }
    onChanges(changes) {
        const { module, node } = getContext(this);
        const classList = module.resolve(this.classFunction, changes, this);
        for (let key in classList) {
            classList[key] ? node.classList.add(key) : node.classList.remove(key);
        }
    }
}
ClassDirective.meta = {
    selector: `[[class]]`,
};
//# sourceMappingURL=class.directive.js.map