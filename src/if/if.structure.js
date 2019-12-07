import Structure from '../core/structure';
import { getContext } from '../module/module';

export default class IfStructure extends Structure {

	onInit() {
		const { module, node } = getContext(this);
		const ifbegin = this.ifbegin = document.createComment(`*if begin`);
		node.parentNode.replaceChild(ifbegin, node);
		const ifend = this.ifend = document.createComment(`*if end`);
		ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
		const expression = node.getAttribute('*if');
		this.expression = expression;
		this.ifFunction = module.makeFunction(expression);
		const clonedNode = node.cloneNode(true);
		clonedNode.removeAttribute('*if');
		this.clonedNode = clonedNode;
		// console.log('IfStructure.expression', expression);
	}

	onChanges(changes) {
		const { module } = getContext(this);
		// console.log('IfStructure.onChanges', changes, this.expression);
		const value = module.resolve(this.ifFunction, changes, this);
		if (value) {
			if (!this.clonedNode.parentNode) {
				this.ifend.parentNode.insertBefore(this.clonedNode, this.ifend);
				module.compile(this.clonedNode);
			}
		} else {
			if (this.clonedNode.parentNode) {
				this.clonedNode.parentNode.removeChild(this.clonedNode);
				module.remove(this.clonedNode);
			}
		}
	}

}

IfStructure.meta = {
	selector: '[*if]',
};
