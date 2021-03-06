import { FactoryList, IElement, IModuleParsedImportedMeta, IModuleParsedMeta, MatchFunction, PipeMap, SelectorFunction } from '../core/types';
import Module from '../module/module';
export default class Platform {
    /**
     * @param moduleFactory
     * @description This method returns an uncompiled module
     */
    static bootstrap(moduleFactory?: typeof Module): Module;
    protected static querySelector(selector: string): IElement | null;
    protected static resolveMeta(moduleFactory: typeof Module): IModuleParsedMeta;
    protected static resolveImportedMeta(moduleFactory: typeof Module): IModuleParsedImportedMeta;
    protected static resolvePipes(meta: IModuleParsedImportedMeta, exported?: boolean): PipeMap;
    protected static resolveFactories(meta: IModuleParsedImportedMeta, exported?: boolean): FactoryList;
    protected static sortFactories(factories: FactoryList): void;
    protected static getExpressions(selector: string): MatchFunction[];
    protected static unwrapSelectors(factories: FactoryList): SelectorFunction[];
}
export declare const PLATFORM_BROWSER: boolean;
export declare const PLATFORM_JS_DOM: boolean;
export declare const PLATFORM_NODE: boolean;
export declare const PLATFORM_WEB_WORKER: boolean;
export declare const isPlatformServer: boolean;
export declare const isPlatformBrowser: boolean;
export declare const isPlatformWorker: boolean;
