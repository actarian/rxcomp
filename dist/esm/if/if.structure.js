import { getContext } from '../core/factory';
import Structure from '../core/structure';
export default class IfStructure extends Structure {
    onInit() {
        const { node } = getContext(this);
        const ifbegin = this.ifbegin = document.createComment(`*if begin`);
        ifbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(ifbegin, node);
        const ifend = this.ifend = document.createComment(`*if end`);
        ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
        const clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.element = clonedNode.cloneNode(true);
    }
    onChanges() {
        const { module } = getContext(this);
        const element = this.element;
        if (this.if != null) { // !!! keep == loose equality
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
    inputs: ['if'],
};
