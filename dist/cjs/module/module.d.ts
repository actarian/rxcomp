import Factory from '../core/factory';
import { ExpressionFunction, IContext, IElement, IFactoryMeta, IModuleMeta, IModuleParsedMeta, ISelectorResult, IText, SelectorFunction } from '../core/types';
export default class Module {
    meta?: IModuleParsedMeta;
    compile(node: IElement, parentInstance?: Factory | Window): Factory[];
    makeInstance(node: IElement, factory: typeof Factory, selector: string, parentInstance?: Factory | Window, args?: any[]): Factory | undefined;
    makeFunction(expression: string, params?: string[]): ExpressionFunction;
    resolve(expression: ExpressionFunction, parentInstance: Factory | Window, payload: any): any;
    parse(node: IElement, instance: Factory): void;
    remove(node: Node, keepInstance?: Factory): Node;
    destroy(): void;
    protected makeContext(instance: Factory, parentInstance: Factory | Window, node: IElement, selector: string): IContext;
    protected getInstance(node: HTMLElement | Document): Factory | Window | undefined;
    protected getParentInstance(node: Node | null): Factory | Window;
    protected parseTextNode(node: IText, instance: Factory): void;
    protected pushFragment(nodeValue: string, from: number, to: number, expressions: (ExpressionFunction | string)[]): void;
    protected parseTextNodeExpression(nodeValue: string): (ExpressionFunction | string)[];
    protected makeHosts(meta: IFactoryMeta, instance: Factory, node: IElement): void;
    protected makeInput(instance: Factory, key: string): ExpressionFunction | null;
    protected makeInputs(meta: IFactoryMeta, instance: Factory): {
        [key: string]: ExpressionFunction;
    };
    protected makeOutput(instance: Factory, key: string): ExpressionFunction | null;
    protected makeOutputs(meta: IFactoryMeta, instance: Factory): {
        [key: string]: ExpressionFunction;
    };
    protected resolveInputsOutputs(instance: Factory, changes: Factory | Window): void;
    protected static parseExpression(expression: string): string;
    protected static parsePipes(expression: string): string;
    protected static parsePipeParams(expression: string): string[];
    protected static parseOptionalChaining(expression: string): string;
    protected static makeContext(module: Module, instance: Factory, parentInstance: Factory | Window, node: IElement, factory: typeof Factory, selector: string): IContext;
    protected static deleteContext(id: number, keepContext: IContext | undefined): IContext[];
    protected static matchSelectors(node: HTMLElement, selectors: SelectorFunction[], results: ISelectorResult[]): ISelectorResult[];
    protected static querySelectorsAll(node: Node, selectors: SelectorFunction[], results: ISelectorResult[]): ISelectorResult[];
    protected static traverseUp(node: Node | null, callback: (node: Node, i: number) => any, i?: number): any;
    protected static traverseDown(node: Node | null, callback: (node: Node, i: number) => any, i?: number): any;
    protected static traversePrevious(node: Node | null, callback: (node: Node, i: number) => any, i?: number): any;
    protected static traverseNext(node: Node | null, callback: (node: Node, i: number) => any, i?: number): any;
    static meta: IModuleMeta;
}
export declare function getContextByNode(node: Node): IContext | undefined;
export declare function getHost(instance: Factory, factory: typeof Factory, node: IElement): Factory | undefined;
