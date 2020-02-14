import Factory, { ExpressionFunction, RxCompElement } from '../core/factory';
import Structure from '../core/structure';
import { IExpressionToken } from '../for/for.structure';
export default class IfStructure extends Structure {
    ifbegin: Comment;
    ifend: Comment;
    instances: Factory[];
    token: IExpressionToken;
    ifFunction: ExpressionFunction;
    clonedNode: RxCompElement;
    node: RxCompElement;
    onInit(): void;
    onChanges(changes: any): void;
}
