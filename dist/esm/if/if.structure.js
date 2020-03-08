import { getContext } from '../core/factory';
import Structure from '../core/structure';
export default class IfStructure extends Structure {
    onInit() {
        const { module, node } = getContext(this);
        const ifbegin = this.ifbegin = document.createComment(`*if begin`);
        ifbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(ifbegin, node);
        const ifend = this.ifend = document.createComment(`*if end`);
        ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
        const expression = node.getAttribute('*if');
        this.ifFunction = module.makeFunction(expression);
        const clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.element = clonedNode.cloneNode(true);
        // console.log('IfStructure.expression', expression);
    }
    onChanges(changes) {
        const { module, parentInstance } = getContext(this);
        // console.log('IfStructure.onChanges', parentInstance);
        const value = module.resolve(this.ifFunction, parentInstance, this);
        const element = this.element;
        if (value) {
            if (!element.parentNode) {
                const ifend = this.ifend;
                ifend.parentNode.insertBefore(element, ifend);
                module.compile(element);
            }
        }
        else {
            if (element.parentNode) {
                module.remove(element, this);
                element.parentNode.removeChild(element);
                this.element = this.clonedNode.cloneNode(true);
            }
        }
    }
}
IfStructure.meta = {
    selector: '[*if]',
};
