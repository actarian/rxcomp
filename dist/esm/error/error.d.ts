import { Observable, ReplaySubject } from "rxjs";
import Factory from "../core/factory";
import Module from "../module/module";
export declare class ModuleError extends Error {
}
export declare class ExpressionError extends Error {
    module: Module;
    instance: Factory;
    expression: string;
    params: any[];
    template: string;
    constructor(error: Error, module: Module, instance: Factory, expression: string, params: any[]);
}
export interface IErrorHandler {
    handle(error: Error): Observable<Error | void>;
}
export interface IErrorInterceptor {
    intercept(error: Error | void, next: IErrorHandler): Observable<Error | void>;
}
export declare class ErrorInterceptorHandler implements IErrorHandler {
    private next;
    private interceptor;
    constructor(next: IErrorHandler, interceptor: IErrorInterceptor);
    handle(error: Error | void): Observable<Error | void>;
}
export declare class DefaultErrorHandler implements IErrorHandler {
    handle(error: Error | void): Observable<Error | void>;
}
export declare const ErrorInterceptors: IErrorInterceptor[];
export declare const nextError$: ReplaySubject<Error>;
export declare const errors$: Observable<Error | void>;
