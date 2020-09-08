import Factory from '../core/factory';
import Structure from '../core/structure';
import { IComment, IElement, IFactoryMeta, IForExpressionTokens } from '../core/types';
import Module from '../module/module';
export default class ForStructure extends Structure {
    instances: Factory[];
    forbegin: IComment;
    forend: IComment;
    tokens: IForExpressionTokens;
    onInit(): void;
    onChanges(): void;
    static getInputsTokens(instance: ForStructure, node: IElement, module: Module): {
        [key: string]: string;
    };
    static getForExpressionTokens(expression: string): IForExpressionTokens;
    static meta: IFactoryMeta;
}
