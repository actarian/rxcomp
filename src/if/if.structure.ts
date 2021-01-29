import { getContext } from '../core/factory';
import Structure from '../core/structure';
import { IComment, IElement, IFactoryMeta } from '../core/types';

export default class IfStructure extends Structure {
	nodeRef?: IComment;
	clonedNode?: IElement;
	element?: IElement;
	onInit() {
		const { node } = getContext(this);
		const nodeRef: IComment = this.nodeRef = document.createComment(`*if`);
		node.parentNode!.replaceChild(nodeRef, node);
		const clonedNode = node.cloneNode(true) as IElement;
		clonedNode.removeAttribute('*if');
		this.clonedNode = clonedNode;
		this.element = clonedNode.cloneNode(true) as IElement;
	}
	onChanges() {
		const { module, parentInstance } = getContext(this);
		const element: IElement = this.element!;
		// console.log('IfStructure.onChanges.if', this.if);
		if (Boolean(this.if)) { // !!! keep == loose equality
			if (!element.parentNode) {
				const nodeRef = this.nodeRef!;
				nodeRef.parentNode!.insertBefore(element, nodeRef);
				module.compile(element, parentInstance);
				// console.log('IfStructure.onChanges.add', element);
			}
		} else {
			if (element.parentNode) {
				module.remove(element, this);
				element.parentNode.removeChild(element);
				this.element = this.clonedNode!.cloneNode(true) as IElement;
				// console.log('IfStructure.onChanges.remove', element);
			}
		}
	}
	static meta: IFactoryMeta = {
		selector: '[*if]',
		inputs: ['if'],
	};
}
