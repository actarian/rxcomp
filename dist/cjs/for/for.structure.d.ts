import Factory from '../core/factory';
import Structure from '../core/structure';
import { ExpressionFunction, IComment, IExpressionToken, IFactoryMeta } from '../core/types';
export default class ForStructure extends Structure {
    instances: Factory[];
    forend?: IComment;
    token?: IExpressionToken;
    forFunction?: ExpressionFunction;
    onInit(): void;
    onChanges(changes: Factory | Window): void;
    getExpressionToken(expression: string): IExpressionToken;
    static meta: IFactoryMeta;
}
