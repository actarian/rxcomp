import Factory from '../core/factory';
import Structure from '../core/structure';
import { ExpressionFunction, IComment, IElement, IFactoryMeta } from '../core/types';
export default class IfStructure extends Structure {
    ifend?: IComment;
    ifFunction?: ExpressionFunction;
    clonedNode?: IElement;
    element?: IElement;
    onInit(): void;
    onChanges(changes: Factory | Window): void;
    static meta: IFactoryMeta;
}
