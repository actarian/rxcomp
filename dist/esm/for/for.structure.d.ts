import Factory from '../core/factory';
import Structure from '../core/structure';
import { IComment, IFactoryMeta, IForExpressionTokens } from '../core/types';
export default class ForStructure extends Structure {
    instances: Factory[];
    nodeRef: IComment;
    tokens: IForExpressionTokens;
    onInit(): void;
    onChanges(): void;
    static mapExpression(key: string, expression: string): string;
    static getForExpressionTokens(expression?: string | null): IForExpressionTokens;
    static meta: IFactoryMeta;
}
