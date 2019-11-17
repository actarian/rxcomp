import Structure from '../core/structure';
import Module from '../module/module';

export default class IfStructure extends Structure {

	onInit() {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
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
		// console.log('expression', expression);
	}

	onChanges(changes) {
		const context = Module.getContext(this);
		const module = context.module;
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
