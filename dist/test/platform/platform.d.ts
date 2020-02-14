import Factory, { RxCompElement, SelectorFunction } from '../core/factory';
import Pipe from '../core/pipe';
import Module, { IModuleMeta } from '../module/module';
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
