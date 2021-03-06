import { of, ReplaySubject } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { getContext } from "../core/factory";
export class ModuleError extends Error {
}
export class ExpressionError extends Error {
    constructor(error, module, instance, expression, params) {
        const message = `ExpressionError in ${instance.constructor.name} "${expression}"
		${error.message}`;
        super(message);
        this.name = error.name;
        // this.stack = error.stack;
        this.module = module;
        this.instance = instance;
        this.expression = expression;
        this.params = params;
        const { node } = getContext(instance);
        this.template = node.outerHTML;
    }
}
export class ErrorInterceptorHandler {
    constructor(next, interceptor) {
        this.next = next;
        this.interceptor = interceptor;
    }
    handle(error) {
        return this.interceptor.intercept(error, this.next);
    }
}
export class DefaultErrorHandler {
    handle(error) {
        return of(error);
    }
}
export const ErrorInterceptors = [];
export const nextError$ = new ReplaySubject(1);
export const errors$ = nextError$.pipe(switchMap((error) => {
    const chain = ErrorInterceptors.reduceRight((next, interceptor) => {
        return new ErrorInterceptorHandler(next, interceptor);
    }, new DefaultErrorHandler());
    return chain.handle(error);
}), tap((error) => {
    if (error) {
        console.error(error);
    }
}));
