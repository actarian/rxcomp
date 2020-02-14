declare module "core/factory" {
    import { BehaviorSubject, Subject } from "rxjs";
    export type SelectorFunction = (node: HTMLElement) => boolean;
    export type ExpressionFunction = () => any;
    export interface IFactoryMeta {
        selector: string;
        hosts?: {
            [key: string]: typeof Factory;
        };
        inputs?: string[];
        outputs?: string[];
        template?: string;
    }
    export class RxCompElement extends HTMLElement {
        rxcompId?: number;
    }
    export class RxCompText extends Text {
        nodeExpressions?: (ExpressionFunction | string)[];
    }
    export default class Factory {
        rxcompId?: number;
        changes$?: BehaviorSubject<Factory>;
        unsubscribe$?: Subject<void>;
        pushChanges?: Function;
        static meta: IFactoryMeta;
        constructor(...args: any[]);
    }
}
declare module "core/directive" {
    import Factory from "core/factory";
    export default class Directive extends Factory {
    }
}
declare module "core/component" {
    import Factory from "core/factory";
    export default class Component extends Factory {
    }
}
declare module "core/context" {
    import Component from "core/component";
    import Factory from "core/factory";
    export default class Context extends Component {
        constructor(instance: Factory, descriptors?: {});
        static mergeDescriptors(source: any, instance: any, descriptors?: {}): {};
    }
}
declare module "core/pipe" {
    export default class Pipe {
        static transform(value: any): any;
        static meta: any;
    }
}
declare module "core/structure" {
    import Factory from "core/factory";
    export default class Structure extends Factory {
    }
}
declare module "module/module" {
    import Factory, { ExpressionFunction, IFactoryMeta, RxCompElement, RxCompText, SelectorFunction } from "core/factory";
    import Pipe from "core/pipe";
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
    export function getContext(instance: Factory): ModuleContext;
    export function getContextByNode(node: Node): ModuleContext | void;
    export function getHost(instance: Factory, factory: typeof Factory, node: RxCompElement): any;
}
declare module "class/class.directive" {
    import Directive from "core/directive";
    import { ExpressionFunction } from "core/factory";
    export default class ClassDirective extends Directive {
        classFunction: ExpressionFunction;
        onInit(): void;
        onChanges(changes: any): void;
    }
}
declare module "event/event.directive" {
    import { Observable } from 'rxjs';
    import Directive from "core/directive";
    export default class EventDirective extends Directive {
        event: string;
        event$: Observable<Event>;
        onInit(): void;
    }
}
declare module "for/for.item" {
    import Context from "core/context";
    import Factory from "core/factory";
    export default class ForItem extends Context {
        index: number;
        count: number;
        constructor(key: string, $key: number | string, value: string, $value: any, index: number, count: number, parentInstance: Factory);
        get first(): boolean;
        get last(): boolean;
        get even(): boolean;
        get odd(): boolean;
    }
}
declare module "for/for.structure" {
    import Factory, { ExpressionFunction } from "core/factory";
    import Structure from "core/structure";
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
}
declare module "href/href.directive" {
    import Directive from "core/directive";
    export default class HrefDirective extends Directive {
        href: string;
        onChanges(changes: any): void;
    }
}
declare module "if/if.structure" {
    import Factory, { ExpressionFunction, RxCompElement } from "core/factory";
    import { IExpressionToken } from "for/for.structure";
    import Structure from "core/structure";
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
}
declare module "inner-html/inner-html.directive" {
    import Directive from "core/directive";
    export default class InnerHtmlDirective extends Directive {
        innerHTML: string;
        onChanges(changes: any): void;
    }
}
declare module "json/json.pipe" {
    import Pipe from "core/pipe";
    export default class JsonPipe extends Pipe {
        static transform(value: any): string;
    }
}
declare module "src/src.directive" {
    import Directive from "core/directive";
    export default class SrcDirective extends Directive {
        src: string;
        onChanges(changes: any): void;
    }
}
declare module "style/style.directive" {
    import Directive from "core/directive";
    import { ExpressionFunction } from "core/factory";
    export default class StyleDirective extends Directive {
        styleFunction: ExpressionFunction;
        onInit(): void;
        onChanges(changes: any): void;
    }
}
declare module "core.module" {
    import Module from "module/module";
    export default class CoreModule extends Module {
    }
}
declare module "platform/platform" {
    import Factory, { RxCompElement, SelectorFunction } from "core/factory";
    import Pipe from "core/pipe";
    import Module, { IModuleMeta } from "module/module";
    export default class Platform {
        static bootstrap(moduleFactory: typeof Module): Module;
        static querySelector(selector: string): RxCompElement | null;
        static resolveMeta(moduleFactory: typeof Module): IModuleMeta;
        static resolvePipes(meta: IModuleMeta, exported?: boolean): {
            [key: string]: typeof Pipe;
        };
        static resolveFactories(meta: IModuleMeta, exported?: boolean): (typeof Factory)[];
        static sortFactories(factories: (typeof Factory)[]): void;
        static getExpressions(selector: string): SelectorFunction[];
        static unwrapSelectors(factories: (typeof Factory)[]): SelectorFunction[];
        static isBrowser(): boolean;
    }
}
declare module "platform/browser" {
    import Platform from "platform/platform";
    export default class Browser extends Platform {
    }
}
declare module "rxcomp" {
    export { default as ClassDirective } from "class/class.directive";
    export { default as CoreModule } from "core.module";
    export { default as Component } from "core/component";
    export { default as Context } from "core/context";
    export { default as Directive } from "core/directive";
    export { default as Pipe } from "core/pipe";
    export { default as Structure } from "core/structure";
    export { default as EventDirective } from "event/event.directive";
    export { default as ForItem } from "for/for.item";
    export { default as ForStructure } from "for/for.structure";
    export { default as HrefDirective } from "href/href.directive";
    export { default as IfStructure } from "if/if.structure";
    export { default as InnerHtmlDirective } from "inner-html/inner-html.directive";
    export { default as JsonPipe } from "json/json.pipe";
    export { default as Module, getContext, getContextByNode, getHost } from "module/module";
    export { default as Browser } from "platform/browser";
    export { default as Platform } from "platform/platform";
    export { default as SrcDirective } from "src/src.directive";
    export { default as StyleDirective } from "style/style.directive";
}
