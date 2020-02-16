import Factory, { ExpressionFunction, IElement } from '../core/factory';
import Structure from '../core/structure';
import { IExpressionToken } from '../for/for.structure';
import { getContext } from '../module/module';

export default class IfStructure extends Structure {

	ifbegin: Comment;
	ifend: Comment;
	instances: Factory[] = [];
	token: IExpressionToken;
	ifFunction: ExpressionFunction;
	clonedNode: IElement;
	node: IElement;

	onInit() {
		const { module, node } = getContext(this);
		const ifbegin = this.ifbegin = document.createComment(`*if begin`);
		ifbegin['rxcompId'] = node.rxcompId;
		node.parentNode.replaceChild(ifbegin, node);
		const ifend = this.ifend = document.createComment(`*if end`);
		ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
		const expression = node.getAttribute('*if');
		this.ifFunction = module.makeFunction(expression);
		const clonedNode = node.cloneNode(true) as IElement;
		clonedNode.removeAttribute('*if');
		this.clonedNode = clonedNode;
		this.node = clonedNode.cloneNode(true) as IElement;
		// console.log('IfStructure.expression', expression);
	}

	onChanges(changes) {
		const { module } = getContext(this);
		// console.log('IfStructure.onChanges', changes);
		const value = module.resolve(this.ifFunction, changes, this);
		const node = this.node;
		if (value) {
			if (!node.parentNode) {
				this.ifend.parentNode.insertBefore(node, this.ifend);
				module.compile(node);
			}
		} else {
			if (node.parentNode) {
				module.remove(node, this);
				node.parentNode.removeChild(node);
				this.node = this.clonedNode.cloneNode(true) as IElement;
			}
		}
	}

}

IfStructure.meta = {
	selector: '[*if]',
};
