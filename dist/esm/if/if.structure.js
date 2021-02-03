import { getContext } from '../core/factory';
import Structure from '../core/structure';
export default class IfStructure extends Structure {
    onInit() {
        const { node } = getContext(this);
        const nodeRef = this.nodeRef = document.createComment(`*if`);
        node.parentNode.replaceChild(nodeRef, node);
        const clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.element = clonedNode.cloneNode(true);
    }
    onChanges() {
        const { module, parentInstance } = getContext(this);
        const element = this.element;
        // console.log('IfStructure.onChanges.if', this.if);
        if (Boolean(this.if)) { // !!! keep == loose equality
            if (!element.parentNode) {
                const nodeRef = this.nodeRef;
                nodeRef.parentNode.insertBefore(element, nodeRef);
                module.compile(element, parentInstance);
                // console.log('IfStructure.onChanges.add', element);
            }
        }
        else {
            if (element.parentNode) {
                module.remove(element, this);
                element.parentNode.removeChild(element);
                this.element = this.clonedNode.cloneNode(true);
                // console.log('IfStructure.onChanges.remove', element);
            }
        }
    }
}
IfStructure.meta = {
    selector: '[*if]',
    inputs: ['if'],
};
