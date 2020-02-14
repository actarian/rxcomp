import Structure from '../core/structure';
import { getContext } from '../module/module';
export default class IfStructure extends Structure {
    constructor() {
        super(...arguments);
        this.instances = [];
    }
    onInit() {
        const { module, node } = getContext(this);
        const ifbegin = this.ifbegin = document.createComment(`*if begin`);
        ifbegin['rxcompId'] = node.rxcompId;
        node.parentNode.replaceChild(ifbegin, node);
        const ifend = this.ifend = document.createComment(`*if end`);
        ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
        const expression = node.getAttribute('*if');
        this.ifFunction = module.makeFunction(expression);
        const clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.node = clonedNode.cloneNode(true);
    }
    onChanges(changes) {
        const { module } = getContext(this);
        const value = module.resolve(this.ifFunction, changes, this);
        const node = this.node;
        if (value) {
            if (!node.parentNode) {
                this.ifend.parentNode.insertBefore(node, this.ifend);
                module.compile(node);
            }
        }
        else {
            if (node.parentNode) {
                module.remove(node, this);
                node.parentNode.removeChild(node);
                this.node = this.clonedNode.cloneNode(true);
            }
        }
    }
}
IfStructure.meta = {
    selector: '[*if]',
};
//# sourceMappingURL=if.structure.js.map