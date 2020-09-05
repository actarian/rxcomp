import { getContext } from '../core/factory';
import Structure from '../core/structure';
import { IComment, IElement, IFactoryMeta } from '../core/types';

export default class IfStructure extends Structure {
	ifbegin?: IComment;
	ifend?: IComment;
	clonedNode?: IElement;
	element?: IElement;
	onInit() {
		const { node } = getContext(this);
		const ifbegin: IComment = this.ifbegin = document.createComment(`*if begin`);
		ifbegin.rxcompId = node.rxcompId;
		node.parentNode!.replaceChild(ifbegin, node);
		const ifend: IComment = this.ifend = document.createComment(`*if end`);
		ifbegin.parentNode!.insertBefore(ifend, ifbegin.nextSibling);
		const clonedNode = node.cloneNode(true) as IElement;
		clonedNode.removeAttribute('*if');
		this.clonedNode = clonedNode;
		this.element = clonedNode.cloneNode(true) as IElement;
	}
	onChanges() {
		const { module } = getContext(this);
		const element: IElement = this.element!;
		// console.log('IfStructure.onChanges.if', this.if);
		if (Boolean(this.if)) { // !!! keep == loose equality
			if (!element.parentNode) {
				const ifend = this.ifend!;
				ifend.parentNode!.insertBefore(element, ifend);
				module.compile(element);
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
