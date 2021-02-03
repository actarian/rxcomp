import Structure from '../core/structure';
import { IComment, IElement, IFactoryMeta } from '../core/types';
export default class IfStructure extends Structure {
    nodeRef?: IComment;
    clonedNode?: IElement;
    element?: IElement;
    onInit(): void;
    onChanges(): void;
    static meta: IFactoryMeta;
}
