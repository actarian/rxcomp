import Factory, { ExpressionFunction, IFactoryMeta, RxCompElement, RxCompText, SelectorFunction } from '../core/factory';
import Pipe from '../core/pipe';
export interface ModuleContext {
    module: Module;
    instance: Factory;
    parentInstance: Factory | Window;
    node: RxCompElement;
    factory: typeof Factory;
    selector: string;
    inputs?: {};
    outputs?: {};
}
export interface IModuleMeta {
    declarations?: (typeof Factory | typeof Pipe)[];
    exports?: (typeof Factory | typeof Pipe)[];
    imports?: (typeof Module | IModuleMeta)[];
    pipes?: {
        [key: string]: typeof Pipe;
    };
    factories?: typeof Factory[];
    selectors?: SelectorFunction[];
    bootstrap?: typeof Factory;
    node?: RxCompElement;
    nodeInnerHTML?: string;
}
export default class Module {
    meta: IModuleMeta;
    compile(node: RxCompElement, parentInstance?: Factory | Window): Factory[];
    makeInstance(node: RxCompElement, factory: typeof Factory, selector: string, parentInstance: Factory | Window, args?: any[]): Factory | void;
    makeContext(instance: Factory, parentInstance: Factory | Window, node: RxCompElement, selector: string): ModuleContext;
    makeFunction(expression: string, params?: string[]): ExpressionFunction;
    getInstance(node: HTMLElement | Document): Factory | Window;
    getParentInstance(node: Node): Factory | Window;
    parse(node: HTMLElement, instance: Factory): void;
    parseTextNode(node: RxCompText, instance: Factory): void;
    pushFragment(nodeValue: string, from: number, to: number, expressions: (ExpressionFunction | string)[]): void;
    parseTextNodeExpression(nodeValue: string): (ExpressionFunction | string)[];
    resolve(expression: ExpressionFunction, parentInstance: Factory | Window, payload: any): any;
    makeHosts(meta: IFactoryMeta, instance: Factory, node: RxCompElement): void;
    makeInput(instance: any, key: any): any;
    makeInputs(meta: any, instance: any): {};
    makeOutput(instance: any, key: any): ExpressionFunction;
    makeOutputs(meta: any, instance: any): {};
    resolveInputsOutputs(instance: any, changes: any): void;
    destroy(): void;
    remove(node: any, keepInstance?: any): any;
    static parseExpression(expression: string): string;
    static parsePipes(expression: string): string;
    static parsePipeParams(expression: string): string[];
    static parseOptionalChaining(expression: string): string;
    static makeContext(module: Module, instance: Factory, parentInstance: Factory | Window, node: RxCompElement, factory: typeof Factory, selector: string): ModuleContext;
    static deleteContext(id: any, keepContext: any): any[];
    static matchSelectors(node: any, selectors: any, results: any): any;
    static querySelectorsAll(node: any, selectors: any, results: any): any;
    static traverseUp(node: Node, callback: (node: Node, i: number) => any, i?: number): any;
    static traverseDown(node: Node, callback: (node: Node, i: number) => any, i?: number): any;
    static traversePrevious(node: Node, callback: (node: Node, i: number) => any, i?: number): any;
    static traverseNext(node: Node, callback: (node: Node, i: number) => any, i?: number): any;
    static meta: IModuleMeta;
}
export declare function getContext(instance: Factory): ModuleContext;
export declare function getContextByNode(node: Node): ModuleContext | void;
export declare function getHost(instance: Factory, factory: typeof Factory, node: RxCompElement): any;
