import Factory, { getContext } from '../core/factory';
import Structure from '../core/structure';
import { ExpressionFunction, IComment, IElement } from '../core/types';

export default class IfStructure extends Structure {

	ifend?: IComment;
	ifFunction?: ExpressionFunction;
	clonedNode?: IElement;
	element?: IElement;

	onInit() {
		const { module, node } = getContext(this);
		const ifbegin: IComment = this.ifbegin = document.createComment(`*if begin`);
		ifbegin.rxcompId = node.rxcompId;
		node.parentNode!.replaceChild(ifbegin, node);
		const ifend = this.ifend = document.createComment(`*if end`);
		ifbegin.parentNode!.insertBefore(ifend, ifbegin.nextSibling);
		const expression = node.getAttribute('*if');
		this.ifFunction = module.makeFunction(expression!);
		const clonedNode = node.cloneNode(true) as IElement;
		clonedNode.removeAttribute('*if');
		this.clonedNode = clonedNode;
		this.element = clonedNode.cloneNode(true) as IElement;
		// console.log('IfStructure.expression', expression);
	}

	onChanges(changes: Factory | Window) {
		const { module, parentInstance } = getContext(this);
		// console.log('IfStructure.onChanges', parentInstance);
		const value = module.resolve(this.ifFunction!, parentInstance, this);
		const element: IElement = this.element!;
		if (value) {
			if (!element.parentNode) {
				const ifend = this.ifend!;
				ifend.parentNode!.insertBefore(element, ifend);
				module.compile(element);
			}
		} else {
			if (element.parentNode) {
				module.remove(element, this);
				element.parentNode.removeChild(element);
				this.element = this.clonedNode!.cloneNode(true) as IElement;
			}
		}
	}

	static meta = {
		selector: '[*if]',
	};

}
