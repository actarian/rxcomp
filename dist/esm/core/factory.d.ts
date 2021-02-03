import { Subject } from 'rxjs';
import { ExpressionFunction, IContext, IElement, IFactoryMeta } from './types';
export declare const CONTEXTS: {
    [key: number]: IContext;
};
export declare const NODES: {
    [key: number]: IContext[];
};
export declare const CONTEXT_MAP: Map<Factory, IContext>;
export declare const NODE_MAP: Map<IElement, IContext[]>;
export declare const EXPRESSION_MAP: Map<string, ExpressionFunction>;
export default class Factory {
    static meta: IFactoryMeta;
    unsubscribe$_: Subject<void> | undefined;
    get unsubscribe$(): Subject<void>;
    onInit(): void;
    onChanges(changes: Factory | Window): void;
    onView(): void;
    onDestroy(): void;
    pushChanges(): void;
    onParentDidChange(changes: Factory | Window): void;
    [key: string]: any;
    constructor(...args: any[]);
    static mapExpression(key: string, expression: string): string;
}
export declare function getContext(instance: Factory): IContext;
