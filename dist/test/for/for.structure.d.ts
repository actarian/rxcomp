import Factory, { ExpressionFunction } from '../core/factory';
import Structure from '../core/structure';
export interface IExpressionToken {
    key: string;
    value: string;
    iterable: string;
}
export default class ForStructure extends Structure {
    forbegin: Comment;
    forend: Comment;
    instances: Factory[];
    token: IExpressionToken;
    forFunction: ExpressionFunction;
    onInit(): void;
    onChanges(changes: any): void;
    getExpressionToken(expression: string): IExpressionToken;
}
