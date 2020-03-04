import { FactoryList, IElement, IModuleParsedImportedMeta, IModuleParsedMeta, MatchFunction, PipeMap, SelectorFunction } from '../core/types';
import Module from '../module/module';
export default class Platform {
    static bootstrap(moduleFactory?: typeof Module): Module;
    static isBrowser(): boolean;
    protected static querySelector(selector: string): IElement | null;
    protected static resolveMeta(moduleFactory: typeof Module): IModuleParsedMeta;
    protected static resolveImportedMeta(moduleFactory: typeof Module): IModuleParsedImportedMeta;
    protected static resolvePipes(meta: IModuleParsedImportedMeta, exported?: boolean): PipeMap;
    protected static resolveFactories(meta: IModuleParsedImportedMeta, exported?: boolean): FactoryList;
    protected static sortFactories(factories: FactoryList): void;
    protected static getExpressions(selector: string): MatchFunction[];
    protected static unwrapSelectors(factories: FactoryList): SelectorFunction[];
}
