import Factory from '../core/factory';
import Structure from '../core/structure';
import { IComment, IFactoryMeta, IForExpressionTokens } from '../core/types';
export default class ForStructure extends Structure {
    instances: Factory[];
    forbegin: IComment;
    forend: IComment;
    tokens: IForExpressionTokens;
    onInit(): void;
    onChanges(): void;
    static getInputsTokens(instance: ForStructure): string[];
    static getForExpressionTokens(expression: string): IForExpressionTokens;
    static meta: IFactoryMeta;
}
